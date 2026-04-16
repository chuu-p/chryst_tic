use anyhow::Result;
use crossterm::event::{self};

use ratatui::Frame;
use ratatui_textarea::{Input, Key};
use std::time::{Duration, Instant};

mod components;
mod render;
mod systems;
mod world;

use world::GameWorld;

// Fixed timestep: 60 FPS = 16.67ms per frame
const FIXED_TIMESTEP: Duration = Duration::from_nanos(16_666_667);

use ratatui::{Terminal, backend::CrosstermBackend};
use std::io::Stdout;

pub fn app(terminal: &mut Terminal<CrosstermBackend<Stdout>>) -> Result<()> {
    let mut game = GameWorld::new();
    let mut last_frame = Instant::now();
    let mut accumulator = Duration::ZERO;

    loop {
        let now = Instant::now();
        let delta = now.duration_since(last_frame);
        last_frame = now;
        accumulator = accumulator.saturating_add(delta);

        // Fixed timestep update loop
        while accumulator >= FIXED_TIMESTEP {
            game.update(FIXED_TIMESTEP);
            accumulator = accumulator.saturating_sub(FIXED_TIMESTEP);
        }

        // Handle input with timeout - wait up to 16ms for next frame
        if event::poll(FIXED_TIMESTEP)? {
            match crossterm::event::read()?.into() {
                Input { key: Key::Esc, .. } => return Ok(()),
                Input {
                    key: Key::Char('c'),
                    ctrl: true,
                    ..
                } => return Ok(()),
                input => {
                    game.handle_input(input);
                }
            }
        }

        // Render
        terminal.draw(|frame| render_frame(frame, &game))?;
    }
}

fn render_frame(frame: &mut Frame, game: &GameWorld) {
    render::render_game(frame, game);
}
