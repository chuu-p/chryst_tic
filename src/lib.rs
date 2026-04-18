mod alloc;
mod tic80;

use itertools::izip;
use shipyard::{Component, IntoIter, View, World};
use tic80::*;

use rhai::Engine;
use std::sync::mpsc;
use std::sync::{Arc, Mutex};
use std::thread;

enum Button {
    Up = 0,
    Down = 1,
    Left = 2,
    Right = 3,
    A = 4,
    B = 5,
    X = 6,
    Y = 7,
}

enum Color {
    Black = 0,
    White = 1,
    Accent = 2,
    Green = 3,
    Red = 4,
}

static PALETTE_LC: &str = "000000fffffff7d100e86800c0d725abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef";
fn load_palette(palette: &str) {
    for i in 0..16 {
        let r = u8::from_str_radix(&palette[i * 6..i * 6 + 2], 16).unwrap();
        let g = u8::from_str_radix(&palette[i * 6 + 2..i * 6 + 4], 16).unwrap();
        let b = u8::from_str_radix(&palette[i * 6 + 4..i * 6 + 6], 16).unwrap();
        unsafe {
            poke((0x3FC0 + (i * 3) + 0) as i32, r);
            poke((0x3FC0 + (i * 3) + 1) as i32, g);
            poke((0x3FC0 + (i * 3) + 2) as i32, b);
        }
    }
}

// components
#[derive(Component, Debug, Clone)]
pub struct Position {
    pub x: f32,
    pub y: f32,
}

#[derive(Component, Debug, Clone)]
pub struct Node {
    pub id: u32,
    pub name: String,
    pub enabled: bool,
}

#[derive(Component, Debug, Clone, Copy)]
pub struct Transmission {
    pub radius: f32,
}

#[derive(Debug, Clone)]
pub enum ScriptState {
    Idle,
    Running,
    Starting,
    Stopped,
}

#[derive(Component, Clone, Debug)]
pub struct CodeRunner {
    sender: Arc<Mutex<mpsc::Sender<MessageType>>>,
    receiver: Arc<Mutex<mpsc::Receiver<MessageType>>>,
    script: String,
    script_state: ScriptState,
}

#[derive(Debug, Clone)]
enum MessageType {
    Ping(PingMessage),
    Exit,
}

#[derive(Debug, Clone)]
struct PingMessage {
    text: String,
}

pub struct GameWorld {
    pub world: World,
}

fn factory_node() -> (Node, Position, Transmission, CodeRunner) {
    let script = r#"
             loop {
                 let input = wait_for_input();
                 print("eb received: " + input);
             }
         "#
    .to_string();
    // let script = r#"
    //          loop {
    //              let input = wait_for_input();
    //              if input == "exit" {
    //                  print("Exiting Rhai loop!");
    //                  break;
    //              }
    //              print("eb received: " + input);
    //          }
    //      "#
    // .to_string();
    let script_clone = script.clone();
    let script_state = ScriptState::Stopped;
    let (tx, rx) = mpsc::channel::<MessageType>();
    let receiver = Arc::new(Mutex::new(rx));
    let sender = Arc::new(Mutex::new(tx));

    // let script_clone = script.clone();
    let rx_clone = receiver.clone();
    let tx_clone = sender.clone();
    let _handle = thread::spawn(move || {
        let mut engine = Engine::new();
        // Register our blocking receive function
        engine.register_fn("wait_for_input", move || -> MessageType {
            let rx = rx_clone
                .lock()
                .unwrap_or_else(|e| panic!("Failed to lock receiver: {}", e));
            rx.recv().unwrap_or_else(|_| MessageType::Exit)
        });
        engine.register_fn("transmit", move |message: MessageType| -> MessageType {
            let tx = tx_clone
                .lock()
                .unwrap_or_else(|e| panic!("Failed to lock sender: {}", e));
            tx.send(message)
                .unwrap_or_else(|e| panic!("Failed to send message: {}", e));
            MessageType::Exit
        });
        engine
            .eval::<()>(&script_clone)
            .unwrap_or_else(|e| panic!("Script evaluation failed: {}", e));
    });

    (
        Node {
            id: 1,
            name: "Beisfrost".to_string(),
            enabled: true,
        },
        Position { x: 120.0, y: 60.0 },
        Transmission { radius: 10.0 },
        CodeRunner {
            sender,
            receiver,
            script,
            script_state,
        },
    )
}

impl GameWorld {
    pub fn new() -> Self {
        let mut world = World::new();

        world.add_entity(factory_node());

        Self { world }
    }
}
unsafe fn debug_send_message() {
    let world = WORLD.as_mut().unwrap();

    let (entity_id, position_data): (Option<shipyard::EntityId>, (f32, f32)) = {
        let positions = world.world.borrow::<View<Position>>().unwrap();
        positions
            .iter()
            .with_id()
            .next()
            .map(|(id, p)| (Some(id), (p.x, p.y)))
            .unwrap_or((None, (0.0, 0.0)))
    };

    if let Some(entity) = entity_id {
        let bf = world.world.get::<&mut CodeRunner>(entity).unwrap();
        bf.sender
            .lock()
            .unwrap()
            .send(MessageType::Ping(PingMessage {
                text: "A".to_string(),
            }))
            .unwrap();
    }
}

unsafe fn render_nodes() {
    let world = WORLD.as_mut().unwrap();

    let (entity_id, position_data): (Option<shipyard::EntityId>, (f32, f32)) = {
        let positions = world.world.borrow::<View<Position>>().unwrap();
        positions
            .iter()
            .with_id()
            .next()
            .map(|(id, p)| (Some(id), (p.x, p.y)))
            .unwrap_or((None, (0.0, 0.0)))
    };

    if let Some(entity) = entity_id {
        if btn(0) {
            world.world.get::<&mut Position>(entity).unwrap().y -= 1.0;
        }
        if btn(1) {
            world.world.get::<&mut Position>(entity).unwrap().y += 1.0;
        }
        if btn(2) {
            world.world.get::<&mut Position>(entity).unwrap().x -= 1.0;
        }
        if btn(3) {
            world.world.get::<&mut Position>(entity).unwrap().x += 1.0;
        }
    }
    let (node_data, position_data, transmission_data): (Vec<_>, Vec<_>, Vec<_>) = {
        let nodes = world.world.borrow::<View<Node>>().unwrap();
        let positions = world.world.borrow::<View<Position>>().unwrap();
        let transmissions = world.world.borrow::<View<Transmission>>().unwrap();
        (
            nodes.iter().cloned().collect(),
            positions.iter().cloned().collect(),
            transmissions.iter().cloned().collect(),
        )
    };

    for (node, position, transmission) in izip!(
        node_data.iter(),
        position_data.iter(),
        transmission_data.iter()
    ) {
        circb(
            position.x as i32,
            position.y as i32,
            transmission.radius as i32,
            1,
        );
        let width = print_alloc(&node.name, 1024, 1024, Default::default());

        let opts = PrintOptions {
            color: 1,
            ..Default::default()
        };

        print!(
            format!("{},{}", position.x, position.y),
            position.x as i32,
            position.y as i32,
            PrintOptions::default()
        );
        print!(
            node.name.to_string(),
            position.x as i32,
            position.y as i32 - 8,
            PrintOptions::default()
        );
    }
}

static mut T: i32 = 0;

static mut WORLD: Option<GameWorld> = None;

pub fn init() {
    load_palette(PALETTE_LC);
    unsafe {
        WORLD = Some(GameWorld::new());
    }
}

#[export_name = "TIC"]
pub fn tic() {
    unsafe {
        let start = tic80::time();

        if T == 0 {
            init();
        }

        cls(0);

        // render_nodes();
        if btnp(Button::A as i32, 120, 6) {
            debug_send_message()
        }

        // Render Editor

        let end = tic80::time();
        let elapsed = end - start;
        print!(
            format!("ms/f:{:.2}", elapsed),
            WIDTH - 70,
            8,
            PrintOptions {
                color: 1,
                ..Default::default()
            }
        );

        T += 1;
    }
}
