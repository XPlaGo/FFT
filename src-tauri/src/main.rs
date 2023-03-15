// Copyright 2019-2022 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::Manager;
use window_vibrancy::{apply_vibrancy, apply_acrylic, apply_blur, apply_mica, NSVisualEffectMaterial};
use fourier::{fft, ifft, fft_angular_velocity, Complex};

#[derive(serde::Serialize, serde::Deserialize)]
struct FunctionResponce {
    function_data: Vec<f64>,
    fourier_transformed_data: Vec<f64>,
    fourier_transformed_freq: Vec<f64>,
    result_data: Vec<f64>
}

#[tauri::command]
fn fft_handle(func_data: Vec<f64>, func_base: Vec<f64>) -> FunctionResponce {
    let mut cdata: Vec<fourier::Complex> = func_data.iter().map(|&x| Complex::new(x, 0.0)).collect();
    let fft_res = fft(&mut cdata[..]);
    let fft_res_abs: Vec<f64> = fft_res.to_vec().iter().map(|c| c.norm()).collect();
    let fft_freq = fft_angular_velocity(
            func_data.len(),
            (func_base.last().unwrap() - func_base.first().unwrap()) / func_data.len() as f64
    );
    let mut res_data = ifft(fft_res);
    let mut res_data_real = res_data.to_vec().iter().map(|c| c.re / func_base.len() as f64).rev().collect();
    FunctionResponce {
        function_data: func_data,
        fourier_transformed_data: fft_res_abs,
        fourier_transformed_freq: fft_freq,
        result_data: res_data_real
    }
}

#[tauri::command]
async fn close_splashscreen(window: tauri::Window) {
    // Close splashscreen
    if let Some(splashscreen) = window.get_window("splashscreen") {
        splashscreen.close().unwrap();
    }
    // Show main window
    window.get_window("main").unwrap().show().unwrap();
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            //window.hide().unwrap();
            #[cfg(target_os = "macos")]
            apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
                .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

            #[cfg(target_os = "windows")]
            apply_mica(&window).map_err(|_| {

            });

            window.minimize().unwrap();
            window.unminimize().unwrap();
            window.maximize().unwrap();
            window.unmaximize().unwrap();
            window.maximize().unwrap();
            window.show().unwrap();
            window.set_focus().unwrap();

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![fft_handle, close_splashscreen])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}