import path from 'path';
import fs from 'fs';
import webpack from 'webpack';
import MemoryFS from 'memory-fs';
import tmp from 'tmp';

const p = (...parts) => path.resolve(__dirname, ...parts);

function compiler(fixture) {
  const compiler = webpack({
    context: __dirname,
    entry: p(fixture),
    output: {
      path: p(),
      filename: 'bundle.js',
    },
    module: {
      rules: [{
        test: /\.mo/,
        use: [{
          loader: p('loader.js')
        }]
      }]
    }
  });

  compiler.outputFileSystem = new MemoryFS();

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err);

      resolve(stats);
    });
  });
}

test('Compiles en.mo file to js module', async () => {
  const stats = await compiler('en.mo');
  const output = stats.toJson().modules[0].source;
  expect(output).toBe(`import Gettext, {Catalog} from 'gettextjs';
import compile from 'gettextjs/pluralforms';
import Immutable from 'immutable';

const headers = Immutable.fromJS({"project-id-version":"gettextjs","po-revision-date":"2015-10-26 09","last-translator":"Jonas Obrist <ojiidotch@gmail.com>","language":"en","mime-version":"1.0","content-type":"text/plain; charset=UTF-8","content-transfer-encoding":"8bit","plural-forms":"nplurals=2; plural=(n != 1);"});
const messages = Immutable.fromJS({"":["Project-Id-Version: gettextjs\\nPO-Revision-Date: 2015-10-26 09:11+0000\\nLast-Translator: Jonas Obrist <ojiidotch@gmail.com>\\nLanguage: en\\nMIME-Version: 1.0\\nContent-Type: text/plain; charset=UTF-8\\nContent-Transfer-Encoding: 8bit\\nPlural-Forms: nplurals=2; plural=(n != 1);\\n"],"simple-string":["A simple string"],"singular-string":["Singular form!","Plural form!"]});
const plural = n => ((n != 1)) * 1;

export default new Gettext(Catalog({headers: headers, messages: messages, plural: plural}));`);
});

test('Compiles ja.mo file to js module', async () => {
  const stats = await compiler('ja.mo');
  const output = stats.toJson().modules[0].source;
  expect(output).toBe(`import Gettext, {Catalog} from 'gettextjs';
import compile from 'gettextjs/pluralforms';
import Immutable from 'immutable';

const headers = Immutable.fromJS({"project-id-version":"gettextjs","po-revision-date":"2015-10-26 09","last-translator":"Jonas Obrist <ojiidotch@gmail.com>","language":"ja","mime-version":"1.0","content-type":"text/plain; charset=UTF-8","content-transfer-encoding":"8bit","plural-forms":"nplurals=1; plural=0;"});
const messages = Immutable.fromJS({"":["Project-Id-Version: gettextjs\\nPO-Revision-Date: 2015-10-26 09:11+0000\\nLast-Translator: Jonas Obrist <ojiidotch@gmail.com>\\nLanguage: ja\\nMIME-Version: 1.0\\nContent-Type: text/plain; charset=UTF-8\\nContent-Transfer-Encoding: 8bit\\nPlural-Forms: nplurals=1; plural=0;\\n"],"simple-string":["簡単なストリング"],"singular-string":["日本語には複数形がありません。"]});
const plural = n => (0) * 1;

export default new Gettext(Catalog({headers: headers, messages: messages, plural: plural}));`);
});


test('Compiled file actually works', async () => {
  const stats = await compiler('en.mo');
  const output = stats.toJson().modules[0].source;
  tmp.file((err, path) => {
    if (err) throw err;
    fs.writeSync(path, output);
    const gettext = require(path);
    expect(gettext.gettext('simple-string')).toEqual('A simple string')
  });
});
