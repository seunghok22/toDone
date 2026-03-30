#[tauri::command]
fn quit_app(app: tauri::AppHandle) {
    app.exit(0);
}

use tauri::{
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            let icon = app
                .default_window_icon()
                .cloned()
                .expect("Missing default window icon");

            let _tray = TrayIconBuilder::new()
                .icon(icon)
                .on_tray_icon_event(|tray, event| match event {
                    TrayIconEvent::Click {
                        rect,
                        button,
                        button_state,
                        ..
                    } => {
                        if button == MouseButton::Left && button_state == MouseButtonState::Up {
                            let app = tray.app_handle();
                            if let Some(window) = app.get_webview_window("main") {
                                if window.is_visible().unwrap_or(false) {
                                    window.hide().unwrap();
                                } else {
                                    let sf = window.scale_factor().unwrap_or(1.0);
                                    let pos = rect.position.to_physical::<f64>(sf);
                                    let size = rect.size.to_physical::<f64>(sf);

                                    let tray_x = pos.x as i32;
                                    let tray_y = pos.y as i32;
                                    let tray_width = size.width as i32;
                                    let tray_bottom_y = tray_y + size.height as i32;

                                    let window_size = window.outer_size().unwrap();
                                    let window_w = window_size.width as i32;
                                    let window_h = window_size.height as i32;

                                    // Get monitor height to decide open direction
                                    let monitors = window.available_monitors().unwrap_or_default();
                                    let current_monitor = monitors.into_iter().find(|m| {
                                        let pos = m.position();
                                        let size = m.size();
                                        tray_x >= pos.x as i32 && tray_x <= (pos.x as i32 + size.width as i32)
                                    }).or_else(|| window.current_monitor().ok().flatten());

                                    let (monitor_x, monitor_y, monitor_w, monitor_h) = match current_monitor {
                                        Some(m) => {
                                            let pos = m.position();
                                            let size = m.size();
                                            (pos.x as i32, pos.y as i32, size.width as i32, size.height as i32)
                                        }
                                        None => (0, 0, 1920, 1080), // Fallback
                                    };
                                    // Center horizontally on the tray icon
                                    let mut x = tray_x + (tray_width / 2) - (window_w / 2);
                                    // Clamp so window never goes off the left/right edge
                                    x = x.clamp(monitor_x, monitor_x + monitor_w - window_w);

                                    // macOS: taskbar at top → open below; Windows: taskbar at bottom → open above
                                    let y = if tray_bottom_y > monitor_y + monitor_h / 2 {
                                        // Tray icon is in bottom half (Windows taskbar) → open above
                                        tray_y - window_h
                                    } else {
                                        // Tray icon is in top half (macOS menu bar) → open below
                                        tray_bottom_y
                                    };

                                    let _ = window.set_position(tauri::Position::Physical(
                                        tauri::PhysicalPosition { x, y },
                                    ));

                                    window.show().unwrap();
                                    window.set_focus().unwrap();
                                }
                            }
                        }
                    }
                    _ => {}
                })
                .build(app)?;

            let window = app.get_webview_window("main").unwrap();

            #[cfg(target_os = "macos")]
            let _ = window_vibrancy::apply_vibrancy(
                &window,
                window_vibrancy::NSVisualEffectMaterial::HudWindow,
                None,
                Some(12.0),
            );

            let window_clone = window.clone();
            window.on_window_event(move |event| {
                if let tauri::WindowEvent::Focused(focused) = event {
                    if !focused {
                        window_clone.hide().unwrap();
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![quit_app])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
