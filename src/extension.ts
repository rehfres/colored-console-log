import * as vscode from 'vscode';

var outputChannel = vscode.window.createOutputChannel('asd')

function _toTwoDigitHex(n: number): string {
  const r = n.toString(16);
  outputChannel.appendLine('yo: 1:' + ('0' + r) + ' - 2: ' + r + '   ' + (r.length !== 2 ? '0' + r : r));
  return r.length !== 2 ? '0' + r : r;
}

const GO_MODE: vscode.DocumentFilter = { language: 'javascript', scheme: 'file' };

class GoColorProvider implements vscode.DocumentColorProvider {
  public provideDocumentColors(
    document: vscode.TextDocument, token: vscode.CancellationToken):
    Thenable<vscode.ColorInformation[]> {
      return new Promise(resolve => {
        resolve([{
          range: new vscode.Range(0, 0, 0, 20),
          color: new vscode.Color(0,0,0,1) // get colors from whats there in text now
        }])
      })
  }
  public provideColorPresentations(
    color: vscode.Color, context: { document: vscode.TextDocument, range: vscode.Range }, token: vscode.CancellationToken):
    Thenable<vscode.ColorPresentation[]> {
      return new Promise(resolve => {
        outputChannel.appendLine('bro' + color.alpha);
        resolve([{
          label: `#${_toTwoDigitHex(color.red * 255)}${_toTwoDigitHex(color.green * 255)}${_toTwoDigitHex(color.blue * 255)}${color.alpha !== 1 ? _toTwoDigitHex(Math.round(color.alpha * 255)) : ''}`
        }])
      }) 
  }
}

export function activate(ctx: vscode.ExtensionContext): void {
  ctx.subscriptions.push(
    vscode.languages.registerColorProvider(
      GO_MODE, new GoColorProvider()));
}