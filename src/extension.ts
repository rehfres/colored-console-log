import * as vscode from 'vscode';

const GO_MODE: vscode.DocumentFilter = { language: 'javascript', scheme: 'file' };

class GoColorProvider implements vscode.DocumentColorProvider {
  public provideDocumentColors(
    document: vscode.TextDocument, token: vscode.CancellationToken):
    Thenable<vscode.ColorInformation[]> {
      return new Promise(resolve => {
        resolve([{
          range: new vscode.Range(0, 0, 0, 1),
          color: new vscode.Color(255,0,0,1)
        }])
      })
  }
  public provideColorPresentations(
    color: vscode.Color, context: { document: vscode.TextDocument, range: vscode.Range }, token: vscode.CancellationToken):
    Thenable<vscode.ColorPresentation[]> {
      return new Promise(resolve => {
        resolve([{
          label: color.red.toString()
        }])
      }) 
  }
}

export function activate(ctx: vscode.ExtensionContext): void {
  ctx.subscriptions.push(
    vscode.languages.registerColorProvider(
      GO_MODE, new GoColorProvider()));
}