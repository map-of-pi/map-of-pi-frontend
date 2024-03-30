declare const process: {
  env: {
    APP_VERSION: string;
  };
};

export const environment = {
  isSandbox: false,
  version: typeof process !== 'undefined' && process.env.APP_VERSION ? 'Beta V' + process.env.APP_VERSION : 'Beta V2.0'
};
