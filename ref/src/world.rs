use rand::RngExt;
use ratatui::style::{Modifier, Style};
use ratatui_textarea::{Input, Key, TextArea};
use shipyard::World;
use std::collections::VecDeque;
use std::time::Duration;

use crate::{
    components::{EnergyResource, Node, Position, Script, ScriptState, Transmission},
    systems,
};
use shipyard::EntityId;

pub struct NodeEditor {
    pub active: bool,
    pub entity: Option<EntityId>,
    pub textarea: TextArea<'static>,
}

impl NodeEditor {
    pub fn new(source: String, entity: EntityId) -> Self {
        let mut textarea = TextArea::default();
        textarea.set_cursor_line_style(Style::default().add_modifier(Modifier::REVERSED));
        textarea.insert_str(source);
        Self {
            active: true,
            entity: Some(entity),
            textarea,
        }
    }
}

const SCROLLBACK_CAPACITY: usize = 1000;

pub struct ScrollbackBuffer {
    lines: VecDeque<String>,
}

impl ScrollbackBuffer {
    pub fn new() -> Self {
        Self {
            lines: VecDeque::with_capacity(SCROLLBACK_CAPACITY),
        }
    }

    pub fn push(&mut self, line: impl Into<String>) {
        if self.lines.len() >= SCROLLBACK_CAPACITY {
            self.lines.pop_front();
        }
        self.lines.push_back(line.into());
    }

    pub fn lines(&self) -> &VecDeque<String> {
        &self.lines
    }
}

impl Default for ScrollbackBuffer {
    fn default() -> Self {
        Self::new()
    }
}

pub struct GameWorld {
    pub world: World,
    pub textarea: TextArea<'static>,
    pub scrollback: ScrollbackBuffer,
    pub editor: Option<NodeEditor>,
}

impl GameWorld {
    pub fn new() -> Self {
        let mut world = World::new();
        let mut textarea = TextArea::default();
        textarea.set_cursor_line_style(Style::default().add_modifier(Modifier::REVERSED));
        textarea.set_placeholder_text("enter command");

        world.add_entity((
            Node {
                id: rand::rng().random(),
                name: "Beisfrost".to_string(),
                enabled: true,
            },
            Position { x: 0.0, y: 0.0 },
            Transmission { radius: 7.0 },
            EnergyResource {
                current_charge_kwh: 500.0,
                currently_charging_kw: 0.0,
                currently_discharging_kw: 0.0,
                currently_outputting_kw: 0.0,
                currently_demanding_kw: 0.0,
                max_charge_kw: 1000.0,
                max_discharge_kw: 100.0,
                max_output_kw: 100.0,
            },
            Script {
                script_source: "...".into(),
                script_state: ScriptState::Idle,
            },
        ));

        Self {
            world,
            textarea,
            scrollback: ScrollbackBuffer::new(),
            editor: None,
        }
    }

    pub fn update(&mut self, delta: Duration) {
        // systems::physics_system(&mut self.world, delta);
    }

    pub fn handle_input(&mut self, input: Input) {
        if let Some(ref mut editor) = self.editor {
            match &input {
                Input { key: Key::Esc, .. } => {
                    self.editor = None;
                    return;
                }
                Input {
                    key: Key::Char('s'),
                    ctrl: true,
                    ..
                } => {
                    systems::save_node_editor(&mut self.world, editor, &mut self.scrollback);
                    self.editor = None;
                    return;
                }
                _ => {
                    editor.textarea.input(input);
                }
            }
            return;
        }

        match input {
            Input {
                key: Key::Enter, ..
            } => systems::run_command(
                &mut self.world,
                &mut self.textarea,
                &mut self.scrollback,
                &mut self.editor,
            ),
            _ => {
                self.textarea.input(input);
            }
        }
    }
}

impl Default for GameWorld {
    fn default() -> Self {
        Self::new()
    }
}
