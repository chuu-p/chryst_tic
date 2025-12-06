mod alloc;
mod tic80;

use tic80::*;

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

trait Drawable {
    fn draw(&self);
}

struct DebugGuy {
    pub x: i32,
    pub y: i32,
}

impl Drawable for DebugGuy {
    fn draw(&self) {
        unsafe {
            spr(
                1 + T % 60 / 30 * 2,
                self.x,
                self.y,
                SpriteOptions {
                    w: 2,
                    h: 2,
                    transparent: &[15],
                    scale: 3,
                    ..Default::default()
                },
            );
        }
    }
}

struct Background {}

impl Drawable for Background {
    fn draw(&self) {
        unsafe {
            for x_idx in 0..8 {
                for y_idx in 0..5 {
                    spr(
                        4,
                        32 * x_idx,
                        32 * y_idx,
                        SpriteOptions {
                            w: 8,
                            h: 8,
                            transparent: &[15],
                            scale: 1,
                            ..Default::default()
                        },
                    );
                }
            }
        }
    }
}

static mut T: i32 = 0;

static mut DEBUG_GUY: DebugGuy = DebugGuy { x: 96, y: 24 };

static PALETTE_LC: &str = "313432323e42454b4b3a5f3b7c4545675239625055516b43796c647182459e805c998579ac9086a6a296bcb7a500ffff";

static mut DEBUG: bool = false;

static BACKGROUND: Background = Background {}; 

static mut SCREEN_OBJECTS: [&dyn Drawable; 2] = [
    &BACKGROUND,
unsafe {
    &DEBUG_GUY},
];
pub fn init() {
    load_palette(PALETTE_LC);
    unsafe {
        DEBUG = true;
    }
}

#[export_name = "TIC"]
pub fn tic() {
    unsafe {
        if T == 0 {
            init();
        }
    }

    if btn(0) {
        unsafe { DEBUG_GUY.y -= 1 }
    }
    if btn(1) {
        unsafe { DEBUG_GUY.y += 1 }
    }
    if btn(2) {
        unsafe { DEBUG_GUY.x -= 1 }
    }
    if btn(3) {
        unsafe { DEBUG_GUY.x += 1 }
    }

    cls(1);

    unsafe {
        for screen_obj in SCREEN_OBJECTS {
            screen_obj.draw();
        }
        print!(
            format!("initialized 文 {DEBUG}!"),
            84,
            84,
            PrintOptions {
                small_font: true,
                ..Default::default()
            }
        );
    }

    unsafe {
        T += 1;
    }
}
