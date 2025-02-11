import { type Config } from '@measured/puck';

export const rootConfig: Config['root'] = {
  render: ({ children }) => <div className="mx-auto">{children}</div>,
};
