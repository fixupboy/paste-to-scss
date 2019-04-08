import * as vscode from 'vscode';

const htmlparser = require('htmlparser2');

function getScss(dom: any) {
  console.log(dom);
  return walk(dom);
}

function walk(dom: any) {
  let result = '';
  let classMap: any = {};
  let tagMap: any = {};
  dom.forEach((node: any, index: number) => {
    if (node.next === null) {
      return;
    }
    let attr = node.next.attribs || {};
    let tagName: any = node.next.name;
    let className: any = attr.class;
    let idName = attr.id;
    let child = node.next.children;

    let hasStyle = false;
    if (className && !classMap[className]) {
      result += `.${className} {`;
      classMap[className] = true;
      hasStyle = true;
    } else if (idName) {
      result += `#${idName} {`;
      hasStyle = true;
    } else if (tagName && !tagMap[tagName]) {
      result += `${tagName} {`;
      hasStyle = true;
      tagMap[tagName] = true;
    }

    if (Array.isArray(child) && child.length > 0) {
      result += walk(child);
    }
    if (hasStyle) {
      result += '}';
    }
  });
  return result;
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.pasteToSCSS', () => {
    vscode.env.clipboard.readText().then((html: string) => {
      var handler = new htmlparser.DomHandler(function(error: any, dom: any) {
        let result = getScss(dom);
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
          return;
        }
        let position = editor.selection.active;
        let uri = editor.document.uri;
        let active = editor.selection.active;
        editor.edit(editBuilder => {
          editBuilder.insert(position, result);
          vscode.commands.executeCommand('vscode.executeFormatDocumentProvider', uri, active, {
            insertSpaces: true,
            tabSize: 2
          });
        });
      });
      var parser = new htmlparser.Parser(handler, {});
      parser.write(html);
      parser.end();
    });
  });
  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
