use shipyard::Component;

#[derive(Component, Debug, Clone)]
pub struct Node {
    pub id: u32,
    pub name: String,
    pub enabled: bool,
}

#[derive(Component, Debug, Clone, Copy)]
pub struct Position {
    pub x: f32,
    pub y: f32,
}

#[derive(Component, Debug, Clone, Copy)]
pub struct Transmission {
    pub radius: f32,
}
#[derive(Component, Debug, Clone)]
pub struct EnergyResource {
    pub current_charge_kwh: f32,

    pub currently_charging_kw: f32,
    pub currently_discharging_kw: f32,

    pub currently_outputting_kw: f32,
    pub currently_demanding_kw: f32,

    pub max_charge_kw: f32,
    pub max_discharge_kw: f32,
    pub max_output_kw: f32,
}

#[derive(Debug, Clone)]
pub enum ScriptState {
    Idle,
    Running,
    Starting,
}

#[derive(Component, Debug, Clone)]
pub struct Script {
    pub script_source: String,
    pub script_state: ScriptState,
}
