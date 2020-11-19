function loadjsx(name) {
  return require(`./pages/${name}.jsx`).default;
}

export default [
  { path: 'flow', component: loadjsx('flow') },
  { path: 'flowTaskAtom', component: loadjsx('flowTaskAtom') },
];
