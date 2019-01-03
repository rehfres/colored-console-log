import * as vscode from 'vscode';

let b = ['#6adb36']

function toHex(n: number): string {
  const r = n.toString(16);
  return r.length !== 2 ? '0' + r : r;
}

let newColorIndex = 0
const colors = [
  '#c74b16',
  '#c7166f',
  '#2516c7',
  '#16a9c7',
  '#16c72e',
  '#c7c116',
  '#c76f16',
  '#c71f16',
  '#6c16c7',
  '#1663c7',
  '#16c79e',
  '#86c716',
  '#c79816',
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

const documentFilter: vscode.DocumentFilter[] = [
  { language: 'javascript', scheme: 'file' },
  { language: 'typescript', scheme: 'file' },
  { language: 'vue', scheme: 'file' },
  { language: 'coffeescript', scheme: 'file' },
  { language: 'typescriptreact', scheme: 'file' },
  { language: 'javascriptreact', scheme: 'file' }
]

class GoColorProvider implements vscode.DocumentColorProvider {
  public provideDocumentColors(
    document: vscode.TextDocument, token: vscode.CancellationToken):
    Thenable<vscode.ColorInformation[]> {
      let temp = []
      let m
      let text = document.getText()
      let pattern = /console.log\('%c.*', 'color: (#([a-f0-9]{6}(?:[a-f0-9]{0,2}))\b)/g
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

function insertConsoleLog (type) {
  const activeEditor = vscode.window.activeTextEditor
  const document = activeEditor.document
  let selection: (vscode.Selection | vscode.Range) = activeEditor.selection
  // console.log(selection)
  if (selection.isEmpty) selection = document.getWordRangeAtPosition(selection.end) || selection
  const selectedText = document.getText(selection)
  const thisLine = document.lineAt(selection.end.line)
  let nextLine = document.lineAt(selection.end.translate(1,0).line)
  const whiteSpacesNumber = Math.max(thisLine.firstNonWhitespaceCharacterIndex, nextLine.firstNonWhitespaceCharacterIndex)
  let spaceee = ' '.repeat(whiteSpacesNumber)
  const endOfThisLine = new vscode.Position(selection.end.line, thisLine.range.end.character)
  const sss = '%s '.repeat(selectedText.split(/\S\s*,\s*\S/g).length).trim()
  // console.log(selectedText.split(/\S\s*,\s*\S/g).length, selectedText.split(/\S\s*,\s*\S/g), sss)
  let insertText = type === 'primitive' ? `\n${spaceee}console.log('%c${sss}', 'color: ${newColor()}', ${selectedText});`
    : `\n${spaceee}console.log('%c⧭', 'color: ${newColor()}', ${selectedText});`
  // console.log(document.languageId === 'vue')
  // console.log(insertText)
  if (document.languageId === 'vue') insertText = insertText.slice(0, -1)
  activeEditor.edit(eb => eb.insert(endOfThisLine, insertText)).then(() => {
    if (selectedText) return
    nextLine = document.lineAt(selection.end.translate(1,0).line)
    const endOfNextLine = new vscode.Position(selection.end.translate(1,0).line, nextLine.range.end.character - 1)
    activeEditor.selection = new vscode.Selection(endOfNextLine, endOfNextLine)
  })
}

export function activate(ctx: vscode.ExtensionContext): void {
  ctx.subscriptions.push(vscode.commands.registerCommand('extension.coloredPrimitives', () => insertConsoleLog('primitive')))
  ctx.subscriptions.push(vscode.commands.registerCommand('extension.coloredObject', () => insertConsoleLog('object')))
  ctx.subscriptions.push(
    vscode.languages.registerColorProvider(
      documentFilter, new GoColorProvider()));
}