declare const process: {
  env: {
    APP_VERSION: string;
  };
};

export const environment = {
  isSandbox: true,
  version: typeof process !== 'undefined' && process.env.APP_VERSION ? 'Beta V' + process.env.APP_VERSION : 'Beta V2.0'
};
