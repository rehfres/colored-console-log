import * as vscode from 'vscode';

var outputChannel = vscode.window.createOutputChannel('asd')
let b = '#6adb36'
var selectionRange: vscode.Range
var selectedText: string
var a = 0
var m

function toHex(n: number): string {
  const r = n.toString(16);
  return r.length !== 2 ? '0' + r : r;
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
      // outputChannel.appendLine(JSON.stringify(toRgba(b)));
      let temp = []
      // let ss = [{
      //   range: new vscode.Range(0, 28, 0, 28 + b.length),
      //   color: toRgba(b)
      // }]
      let m
      let text = vscode.window.activeTextEditor.document.getText()
      let pattern = /console.log\('%c%s', 'color: #([a-f0-9]{6}(?:[a-f0-9]{0,2}))\b/g
      while (m = pattern.exec(text)) {
        const positionStart: vscode.Position = vscode.window.activeTextEditor.document.positionAt(pattern.lastIndex)
        const positionEnd: vscode.Position = positionStart.translate(0, b.length)
        console.log(positionStart, positionEnd)
        temp.push({
          range: new vscode.Range(positionStart, positionEnd),
          color: toRgba(b)
        })
        console.log(temp)
      }
      console.log(temp)
      return new Promise(resolve => {
        resolve(temp)
      })
  }
  public provideColorPresentations(
    color: vscode.Color, context: { document: vscode.TextDocument, range: vscode.Range }, token: vscode.CancellationToken):
    Thenable<vscode.ColorPresentation[]> {
      outputChannel.appendLine('2  ' + color.red + ' ' + color.green + ' ' + color.blue);
      b = `#${toHex(color.red * 255)}${toHex(color.green * 255)}${toHex(color.blue * 255)}${color.alpha !== 1 ? toHex(Math.round(color.alpha * 255)) : ''}`
      return new Promise(resolve => {
        resolve([{
          label: b
        }])
      }) 
  }
}

export function activate(ctx: vscode.ExtensionContext): void {
  // console.log('yo')
  // console.log(/console.log\('%c%s', 'color: /g.exec(vscode.window.activeTextEditor.document.getText()))
  vscode.window.onDidChangeTextEditorSelection(event => {
    if (vscode.window.activeTextEditor.selection.isEmpty) return
    a++
    // vscode.debug.activeDebugConsole.appendLine(JSON.stringify(vscode.window.activeTextEditor.selection));
    selectionRange = new vscode.Range(vscode.window.activeTextEditor.selection.start, vscode.window.activeTextEditor.selection.end)
    selectedText = vscode.window.activeTextEditor.document.getText(selectionRange)
    // console.log(selectionRange)
    // console.log(selectedText)
    // console.log(vscode.window.activeTextEditor.document.lineAt(vscode.window.activeTextEditor.selection.end.line))
    // if (a >= 7) 
    vscode.window.activeTextEditor.edit(eb => eb.insert(
      new vscode.Position(vscode.window.activeTextEditor.selection.end.line, vscode.window.activeTextEditor.document.lineAt(vscode.window.activeTextEditor.selection.end.line).range.end.character)
      // new vscode.Position(3,0)
      , 
      `\nconsole.log('%c%s', 'color: ${b}', ${selectedText});`
    ))
  })
  ctx.subscriptions.push(
    vscode.languages.registerColorProvider(
      GO_MODE, new GoColorProvider()));
}