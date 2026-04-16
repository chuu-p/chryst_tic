mod alloc;
mod tic80;

use itertools::izip;
use tic80::*;

// static PALETTE_LC: &str = "313432323e42454b4b3a5f3b7c4545675239625055516b43796c647182459e805c998579ac9086a6a296bcb7a500ffff";
// fn load_palette(palette: &str) {
//     for i in 0..16 {
//         let r = u8::from_str_radix(&palette[i * 6..i * 6 + 2], 16).unwrap();
//         let g = u8::from_str_radix(&palette[i * 6 + 2..i * 6 + 4], 16).unwrap();
//         let b = u8::from_str_radix(&palette[i * 6 + 4..i * 6 + 6], 16).unwrap();
//         unsafe {
//             poke((0x3FC0 + (i * 3) + 0) as i32, r);
//             poke((0x3FC0 + (i * 3) + 1) as i32, g);
//             poke((0x3FC0 + (i * 3) + 2) as i32, b);
//         }
//     }
// }

// TODO this should be a ECS
use shipyard::{Component, IntoIter, View, World};

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

pub struct GameWorld {
    pub world: World,
}

impl GameWorld {
    pub fn new() -> Self {
        let mut world = World::new();

        world.add_entity((
            Node {
                id: 1,
                name: "Beisfrost".to_string(),
                enabled: true,
            },
            Position { x: 0.0, y: 0.0 },
            Transmission { radius: 10.0 },
        ));

        Self { world }
    }
}

static mut T: i32 = 0;

static mut WORLD: Option<GameWorld> = None;

pub fn init() {
    // load_palette(PALETTE_LC);GameWorld::new()
    unsafe {
        WORLD = Some(GameWorld::new());
    }
}

#[export_name = "TIC"]
pub fn tic() {
    unsafe {
        if T == 0 {
            init();
        }

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

        cls(0);

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
        }
        T += 1;
    }
}
