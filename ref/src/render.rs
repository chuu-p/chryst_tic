use ratatui::style::Style;
use ratatui::widgets::{Block, Paragraph};
use ratatui::{
    Frame,
    layout::Rect,
    style::Stylize,
    text::{Line as TextLine, Span, Text},
};

use crate::world::GameWorld;

pub fn render_game(frame: &mut Frame, game: &GameWorld) {
    if let Some(ref editor) = game.editor {
        render_editor(frame, frame.area(), game, editor);
        return;
    }

    render_terminal(frame, frame.area(), game);
}

fn render_terminal(frame: &mut Frame, area: Rect, game: &GameWorld) {
    let terminal_height = area.height as usize;
    let input_line = game
        .textarea
        .lines()
        .first()
        .map(|s| s.as_str())
        .unwrap_or("");

    let scrollback_lines: Vec<TextLine> = game
        .scrollback
        .lines()
        .iter()
        .map(|s| TextLine::from(s.as_str()))
        .collect();

    let mut all_lines: Vec<TextLine> = scrollback_lines.clone();

    let command_with_prompt = if input_line.is_empty() {
        TextLine::from(Span::raw("> "))
    } else {
        TextLine::from(vec![Span::raw("> "), Span::raw(input_line)])
    };
    all_lines.push(command_with_prompt);

    let total_lines = all_lines.len();

    let start_index = if total_lines > terminal_height {
        total_lines - terminal_height
    } else {
        0
    };

    let visible_lines: Vec<TextLine> = all_lines[start_index..].to_vec();

    let scrollback_widget = Paragraph::new(Text::from(visible_lines))
        .block(Block::default())
        .wrap(ratatui::widgets::Wrap { trim: true });
    frame.render_widget(scrollback_widget, area);
}

fn render_editor(
    frame: &mut Frame,
    area: Rect,
    game: &GameWorld,
    editor: &crate::world::NodeEditor,
) {
    let terminal_height = area.height as usize;

    let scrollback_lines: Vec<TextLine> = game
        .scrollback
        .lines()
        .iter()
        .map(|s| TextLine::from(s.as_str()))
        .collect();

    let editor_header = TextLine::from_iter([
        Span::from("--- node editor ---").bold(),
        Span::from(" | Esc: Quit | Ctrl+S: Save"),
    ]);

    let editor_content: Vec<TextLine> = editor
        .textarea
        .lines()
        .iter()
        .map(|s| TextLine::from(s.as_str()))
        .collect();

    let input_text = editor
        .textarea
        .lines()
        .last()
        .map(|s| s.as_str())
        .unwrap_or("");
    let input_with_prompt = if input_text.is_empty() {
        TextLine::from(Span::raw("> "))
    } else {
        TextLine::from(vec![Span::raw("> "), Span::raw(input_text)])
    };

    let mut all_lines: Vec<TextLine> = scrollback_lines;
    all_lines.push(editor_header);
    all_lines.extend(editor_content);
    all_lines.push(input_with_prompt);

    let total_lines = all_lines.len();

    let start_index = if total_lines > terminal_height {
        total_lines - terminal_height
    } else {
        0
    };

    let visible_lines: Vec<TextLine> = all_lines[start_index..].to_vec();

    let editor_widget = Paragraph::new(Text::from(visible_lines))
        .block(Block::default())
        .style(Style::new().green())
        .wrap(ratatui::widgets::Wrap { trim: true });
    frame.render_widget(editor_widget, area);
}
