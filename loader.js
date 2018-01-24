import {parse} from 'gettextjs';

export default function(source) {
  const buffer = source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
  const catalog = parse(buffer);
  const plural_string = catalog.get('headers').get('plural-forms', 'nplurals=2; plural=(n != 1);').split(';')[1].split('plural=')[1].trim();
  return `import Gettext, {Catalog} from 'gettextjs';
import compile from 'gettextjs/pluralforms';
import Immutable from 'immutable';

const headers = Immutable.fromJS(${JSON.stringify(catalog.get('headers').toJS())});
const messages = Immutable.fromJS(${JSON.stringify(catalog.get('messages').toJS())});
const plural = n => (${plural_string}) * 1;

export default new Gettext(Catalog({headers: headers, messages: messages, plural: plural}));`;
};
export const raw = true;
