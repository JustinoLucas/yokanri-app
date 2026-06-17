#[tauri::command]
fn save_translations(strings_json: String, languages_json: String) -> Result<(), String> {
  #[cfg(not(debug_assertions))]
  return Err("Disponível apenas em modo dev".to_string());

  #[cfg(debug_assertions)]
  {
    let base = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
      .parent()
      .ok_or("Não foi possível encontrar o diretório do projeto")?;
    std::fs::write(base.join("src/i18n/strings.json"), &strings_json)
      .map_err(|e| e.to_string())?;
    std::fs::write(base.join("src/i18n/languages.json"), &languages_json)
      .map_err(|e| e.to_string())?;
    Ok(())
  }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![save_translations])
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_sql::Builder::default().build())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_updater::Builder::new().build())
    .plugin(tauri_plugin_process::init())
    .plugin(tauri_plugin_http::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
