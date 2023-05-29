declare module '*.css';
// declare module '*.less';
declare module '*.json';
declare module '*.yaml';

declare module '*.less' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
