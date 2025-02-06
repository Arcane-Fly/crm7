import { logger } from '@/lib/logger';
import { ServiceFactory } from '../service-factory';
import { ServiceRegistry } from '../service-registry';
import { cleanupServices, initializeServices } from '../startup';

jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../service-factory', () => ({
  ServiceFactory: {
    getInstance: jest.fn(() => ({
      resetAllMetrics: jest.fn(),
    })),
  },
}));

jest.mock('../service-registry', () => {
  return {
    ServiceRegistry: jest.fn().mockImplementation(() => ({
      validateDependencies: jest.fn(),
      initialize: jest.fn(),
    })),
  };
});

describe('Startup Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeServices', () => {
    it('should initialize all services successfully', async () => {
      await initializeServices();
      expect(logger.info).toHaveBeenCalledWith('Application services initialized successfully');
    });

    it('should handle initialization errors', async () => {
      const error = new Error('Initialization failed');
      const mockRegistry = {
        validateDependencies: jest.fn(),
        initialize: jest.fn().mockImplementation(() => {
          throw error;
        }),
      };
      (ServiceRegistry as jest.Mock).mockImplementation(() => mockRegistry);

      await expect(initializeServices()).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to initialize application services:',
        expect.any(Error)
      );
    });

    it('should handle unknown errors', async () => {
      const error = 'Unknown error occurred';
      const mockRegistry = {
        validateDependencies: jest.fn(),
        initialize: jest.fn().mockImplementation(() => {
          throw error;
        }),
      };
      (ServiceRegistry as jest.Mock).mockImplementation(() => mockRegistry);

      await expect(initializeServices()).rejects.toThrow();
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to initialize application services:',
        expect.any(Error)
      );
    });
  });

  describe('cleanupServices', () => {
    it('should cleanup all services successfully', async () => {
      await cleanupServices();
      expect(logger.info).toHaveBeenCalledWith('Application services cleaned up successfully');
    });

    it('should handle cleanup errors', async () => {
      const error = new Error('Cleanup failed');
      const mockFactory = {
        resetAllMetrics: jest.fn().mockImplementation(() => {
          throw error;
        }),
      };
      (ServiceFactory.getInstance as jest.Mock).mockReturnValue(mockFactory);

      await expect(cleanupServices()).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to cleanup application services:',
        expect.any(Error)
      );
    });
  });

  describe('Process Signal Handlers', () => {
    let processExitSpy: jest.SpyInstance;
    let processOnSpy: jest.SpyInstance;

    beforeEach(() => {
      processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
      processOnSpy = jest.spyOn(process, 'on');
    });

    afterEach(() => {
      processExitSpy.mockRestore();
      processOnSpy.mockRestore();
    });

    it('should register process signal handlers', () => {
      // Re-run the module code
      jest.isolateModules(() => {
        require('../startup');
      });

      expect(processOnSpy).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
      expect(processOnSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));
    });

    it('should handle SIGTERM signal', async () => {
      let sigtermHandler: () => Promise<void>;
      processOnSpy.mockImplementation((signal: string, handler: () => Promise<void>) => {
        if (signal === 'SIGTERM') {
          sigtermHandler = handler;
        }
      });

      // Re-run the module code to register handlers
      jest.isolateModules(() => {
        require('../startup');
      });

      // Get the registered handler
      const handler = processOnSpy.mock.calls.find(call => call[0] === 'SIGTERM')?.[1];
      if (!handler) {
        throw new Error('SIGTERM handler not found');
      }

      // Call the handler
      await handler();

      expect(logger.info).toHaveBeenCalledWith('SIGTERM received. Starting graceful shutdown...');
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    it('should handle SIGINT signal', async () => {
      let sigintHandler: () => Promise<void>;
      processOnSpy.mockImplementation((signal: string, handler: () => Promise<void>) => {
        if (signal === 'SIGINT') {
          sigintHandler = handler;
        }
      });

      // Re-run the module code to register handlers
      jest.isolateModules(() => {
        require('../startup');
      });

      // Get the registered handler
      const handler = processOnSpy.mock.calls.find(call => call[0] === 'SIGINT')?.[1];
      if (!handler) {
        throw new Error('SIGINT handler not found');
      }

      // Call the handler
      await handler();

      expect(logger.info).toHaveBeenCalledWith('SIGINT received. Starting graceful shutdown...');
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });
  });
});
