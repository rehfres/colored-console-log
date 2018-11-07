import * as vscode from 'vscode';

const activeEditor = vscode.window.activeTextEditor
const document = activeEditor.document
let b = ['#6adb36']

function toHex(n: number): string {
  const r = n.toString(16);
  return r.length !== 2 ? '0' + r : r;
}

let newColorIndex = 0
const colors = [
  '#c74b16',
  '#c71f16',
  '#c7166f',
  '#6c16c7',
  '#2516c7',
  '#1663c7',
  '#16a9c7',
  '#16c79e',
  '#16c72e',
  '#86c716',
  '#c7c116',
  '#c79816',
  '#c76f16',
  '#a66037'
]
function newColor() {
  newColorIndex = (newColorIndex + 1) % colors.length
  return colors[newColorIndex]
}

function toRgba(n: string): vscode.Color {
  n = n.replace('#', '')
  const r = parseInt(n.slice(0,2), 16) / 255
  const g = parseInt(n.slice(2,4), 16) / 255
  const b = parseInt(n.slice(4,6), 16) / 255
  const a = n.length > 7 ? parseInt(n.slice(4,6), 16) / 255 : 1
  return new vscode.Color(r, g, b, a) // get colors from whats there in text now
}

const GO_MODE: vscode.DocumentFilter = { language: 'javascript', scheme: 'file' };

class GoColorProvider implements vscode.DocumentColorProvider {
  public provideDocumentColors(
    document: vscode.TextDocument, token: vscode.CancellationToken):
    Thenable<vscode.ColorInformation[]> {
      let temp = []
      let m
      let text = document.getText()
      let pattern = /console.log\('%c%s', 'color: (#([a-f0-9]{6}(?:[a-f0-9]{0,2}))\b)/g
      b = []
      while (m = pattern.exec(text)) {
        b.push(m[1])
        const positionStart = document.positionAt(pattern.lastIndex - m[1].length)
        const positionEnd = positionStart.translate(0, m[1].length)
        temp.push(new vscode.ColorInformation(new vscode.Range(positionStart, positionEnd), toRgba(b[b.length - 1])))
      }
      return new Promise(resolve => {
        resolve(temp)
      })
  }
  public provideColorPresentations(
    color: vscode.Color, context: { document: vscode.TextDocument, range: vscode.Range }, token: vscode.CancellationToken):
    Thenable<vscode.ColorPresentation[]> {
        return new Promise(resolve => {
        resolve(b.map(el => {
          const bb = `#${toHex(color.red * 255)}${toHex(color.green * 255)}${toHex(color.blue * 255)}${color.alpha !== 1 ? toHex(Math.round(color.alpha * 255)) : ''}`
          return {label: bb}
        }))
      })
  }
}

export function activate(ctx: vscode.ExtensionContext): void {
  vscode.window.onDidChangeTextEditorSelection(event => {
    const selection = activeEditor.selection
    if (selection.isEmpty) return
    const selectedText = document.getText(selection)
    const thisLine = document.lineAt(selection.end.line)
    const nextLine = document.lineAt(selection.end.translate(1,0).line)
    const whiteSpacesNumber = Math.max(thisLine.firstNonWhitespaceCharacterIndex, nextLine.firstNonWhitespaceCharacterIndex)
    let spaceee = ' '.repeat(whiteSpacesNumber)

    const endOfThisLine = new vscode.Position(selection.end.line, thisLine.range.end.character)
    const insertText = `\n${spaceee}console.log('%c%s', 'color: ${newColor()}', ${selectedText});`
    activeEditor.edit(eb => eb.insert(endOfThisLine, insertText))
  })
  ctx.subscriptions.push(
    vscode.languages.registerColorProvider(
      GO_MODE, new GoColorProvider()));
}