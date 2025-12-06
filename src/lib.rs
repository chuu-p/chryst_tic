mod alloc;
mod tic80;

use tic80::*;

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
                    transparent: &[14],
                    scale: 3,
                    ..Default::default()
                },
            );
        }
    }
}

static mut T: i32 = 0;

static mut DEBUG_GUY: DebugGuy = DebugGuy { x: 96, y: 24 };

#[export_name = "TIC"]
pub fn tic() {
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

    cls(13);

    unsafe {
        DEBUG_GUY.draw();
    }

    print!(
        "HELLO DAVE!",
        84,
        84,
        PrintOptions {
            small_font: true,
            ..Default::default()
        }
    );

    unsafe {
        T += 1;
    }
}
