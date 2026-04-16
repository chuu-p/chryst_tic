use rand::RngExt;
use ratatui_textarea::TextArea;
use shipyard::{EntityId, Get, IntoIter, View, ViewMut, World};
use std::env;
use std::fs;
use std::process::Command;

use crate::components::{EnergyResource, Node, Position, Script, ScriptState, Transmission};
use crate::world::{NodeEditor, ScrollbackBuffer};

fn find_node_by_name(world: &World, name: &str) -> Option<EntityId> {
    let nodes = world.borrow::<View<Node>>().ok()?;
    for (entity, node) in nodes.iter().with_id() {
        if node.name == name {
            return Some(entity);
        }
    }
    None
}

pub fn start_node_editor(world: &mut World, name: &str) -> Option<NodeEditor> {
    let entity = find_node_by_name(world, name)?;
    let scripts = world.borrow::<View<Script>>().ok()?;
    let script = scripts.get(entity).ok()?;
    Some(NodeEditor::new(script.script_source.clone(), entity))
}

pub fn save_node_editor(
    world: &mut World,
    editor: &mut NodeEditor,
    scrollback: &mut ScrollbackBuffer,
) {
    let entity = editor.entity.expect("No entity selected");
    let new_source = editor.textarea.lines().join("\n");

    let mut scripts = world.borrow::<ViewMut<Script>>().ok();
    if let Some(ref mut scripts) = scripts {
        if let Ok(mut script) = scripts.get(entity) {
            script.script_source = new_source;
            script.script_state = ScriptState::Starting;
            scrollback.push("Saved script for node, restarting...");
            return;
        }
    }
    scrollback.push("Failed to save script");
}

pub fn run_command(
    world: &mut World,
    textarea: &mut TextArea,
    scrollback: &mut ScrollbackBuffer,
    editor: &mut Option<NodeEditor>,
) {
    let command = &textarea.lines()[0].clone();
    textarea.clear();

    let parts: Vec<&str> = command.split_whitespace().collect();

    match parts.as_slice() {
        ["help"] => {
            scrollback.push("Available commands:");
            scrollback.push("  help - Display this help message");
            scrollback.push("  ls - List all node names");
            scrollback.push("  edit <node_name> - Edit node script in external editor");
            scrollback.push("  node add <name> <x,y> <radius> <kv> - Add a new node");
            scrollback.push("  node list - List all nodes");
            scrollback.push("  node edit <name> - Edit node script (alias for edit)");
            scrollback.push("  quit - Exit the game");
        }

        ["ls"] => {
            let nodes = world.borrow::<View<Node>>().ok();
            if let Some(nodes) = nodes {
                for node in nodes.iter() {
                    scrollback.push(node.name.clone());
                }
                if nodes.iter().count() == 0 {
                    scrollback.push("No nodes found");
                }
            }
        }

        ["node", "add", name, pos, radius, kv] => {
            let (x, y) = pos.split_once(',').unwrap();

            let x: f32 = x.parse().unwrap();
            let y: f32 = y.parse().unwrap();
            let radius: f32 = radius.parse().unwrap();
            let kv: f32 = kv.parse().unwrap();
            let name = name.to_string();

            world.add_entity((
                Node {
                    id: rand::rng().random(),
                    name: name.clone(),
                    enabled: true,
                },
                Position { x: x, y: y },
                Transmission { radius: radius },
                Script {
                    script_source: "...".into(),
                    script_state: ScriptState::Idle,
                },
            ));
            scrollback.push(format!(
                "Add node: name={}, x={}, y={}, radius={}, kv={}",
                name, x, y, radius, kv
            ));
        }
        ["node", "list"] => {
            let (nodes, positions) = world
                .borrow::<(View<Node>, View<Position>)>()
                .expect("Failed to borrow render components");
            for (node, position) in nodes.iter().zip(positions.iter()) {
                scrollback.push(format!(
                    "Node: id={}, name={}, enabled={}, x={}, y={}",
                    node.id, node.name, node.enabled, position.x, position.y,
                ));
            }
        }
        ["node", "edit", name] | ["edit", name] => {
            let entity = find_node_by_name(world, name);
            if entity.is_none() {
                scrollback.push(format!("Node not found: {}", name));
                return;
            }

            let scripts = world.borrow::<View<Script>>().ok();
            let script_source = if let Some(scripts) = scripts {
                scripts
                    .get(entity.unwrap())
                    .ok()
                    .map(|s| s.script_source.clone())
                    .unwrap_or_default()
            } else {
                String::new()
            };

            let temp_dir = env::temp_dir();
            let script_path = temp_dir.join(format!("chryst_{}_script.txt", name));

            if let Err(e) = fs::write(&script_path, &script_source) {
                scrollback.push(format!("Failed to write temp file: {}", e));
                return;
            }

            let editor = env::var("EDITOR").unwrap_or_else(|_| "nvim".to_string());

            let status = Command::new(&editor).arg(script_path.as_os_str()).status();

            match status {
                Ok(exit_status) if exit_status.success() => {
                    match fs::read_to_string(&script_path) {
                        Ok(new_source) => {
                            let mut scripts = world.borrow::<ViewMut<Script>>().ok();
                            if let Some(ref mut scripts) = scripts {
                                if let Ok(mut script) = scripts.get(entity.unwrap()) {
                                    script.script_source = new_source;
                                    script.script_state = ScriptState::Starting;
                                    scrollback.push(format!("Updated script for node '{}'", name));
                                }
                            }
                        }
                        Err(e) => {
                            scrollback.push(format!("Failed to read edited file: {}", e));
                        }
                    }
                }
                Ok(_) => {
                    scrollback.push(format!("Editor exited with error"));
                }
                Err(e) => {
                    scrollback.push(format!("Failed to open editor: {}", e));
                }
            }

            let _ = fs::remove_file(&script_path);
        }
        _ => {
            scrollback.push(format!("Unknown command: {}", command));
        }
    }
}
