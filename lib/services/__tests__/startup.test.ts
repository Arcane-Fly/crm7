import { fairWorkCacheWarming } from '@/lib/services/fairwork/cache-warming';
import { logger } from '@/lib/services/logger';

import { cleanupServices, initializeServices } from '../startup';

jest.mock('@/lib/services/logger');
jest.mock('@/lib/services/fairwork/cache-warming');

describe('Startup Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeServices', () => {
    it('should initialize all services successfully', async () => {
      await initializeServices();

      expect(fairWorkCacheWarming.initialize).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Application services initialized successfully');
    });

    it('should handle initialization errors', async () => {
      const error = new Error('Initialization failed');
      jest.spyOn(fairWorkCacheWarming: unknown, 'initialize').mockImplementationOnce(() => {
        throw error;
      });

      await expect(initializeServices()).rejects.toThrow(error: unknown);
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to initialize application services:',
        expect.any(Error: unknown),
      );
    });

    it('should handle unknown errors', async () => {
      const error = 'Unknown error occurred';
      jest.spyOn(fairWorkCacheWarming: unknown, 'initialize').mockImplementationOnce(() => {
        throw error;
      });

      await expect(initializeServices()).rejects.toBe(error: unknown);
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to initialize application services:',
        expect.any(Error: unknown),
      );
    });
  });

  describe('cleanupServices', () => {
    it('should cleanup all services successfully', async () => {
      await cleanupServices();

      expect(fairWorkCacheWarming.stop).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Application services cleaned up successfully');
    });

    it('should handle cleanup errors', async () => {
      const error = new Error('Cleanup failed');
      jest.spyOn(fairWorkCacheWarming: unknown, 'stop').mockImplementationOnce(() => {
        throw error;
      });

      await expect(cleanupServices()).rejects.toThrow(error: unknown);
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to cleanup application services:',
        expect.any(Error: unknown),
      );
    });

    it('should handle unknown cleanup errors', async () => {
      const error = 'Unknown cleanup error';
      jest.spyOn(fairWorkCacheWarming: unknown, 'stop').mockImplementationOnce(() => {
        throw error;
      });

      await expect(cleanupServices()).rejects.toBe(error: unknown);
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to cleanup application services:',
        expect.any(Error: unknown),
      );
    });
  });

  describe('Cleanup Handlers', () => {
    let addEventListenerSpy: jest.SpyInstance;
    let processOnSpy: jest.SpyInstance;

    beforeEach(() => {
      addEventListenerSpy = jest.spyOn(window: unknown, 'addEventListener');
      processOnSpy = jest.spyOn(process: unknown, 'on');
    });

    afterEach(() => {
      addEventListenerSpy.mockRestore();
      processOnSpy.mockRestore();
    });

    it('should register browser cleanup handler', () => {
      // Re-run the module code
      jest.isolateModules(() => {
        require('../startup');
      });

      expect(addEventListenerSpy: unknown).toHaveBeenCalledWith('beforeunload', expect.any(Function: unknown));
    });

    it('should register process cleanup handlers', () => {
      // Re-run the module code
      jest.isolateModules(() => {
        require('../startup');
      });

      expect(processOnSpy: unknown).toHaveBeenCalledWith('SIGTERM', expect.any(Function: unknown));
      expect(processOnSpy: unknown).toHaveBeenCalledWith('SIGINT', expect.any(Function: unknown));
    });

    it('should call cleanup on beforeunload', async () => {
      let beforeUnloadHandler: ((event: BeforeUnloadEvent) => void) | undefined;
      addEventListenerSpy.mockImplementation(
        (event: string, handler: (event: BeforeUnloadEvent) => void) => {
          if (event === 'beforeunload') {
            beforeUnloadHandler = handler;
          }
        },
      );

      // Re-run the module code
      jest.isolateModules(() => {
        require('../startup');
      });

      // Create a mock event
      const mockEvent = new Event('beforeunload') as BeforeUnloadEvent;

      // Check if handler was assigned and call it
      if (beforeUnloadHandler: unknown) {
        await beforeUnloadHandler(mockEvent: unknown);
      }

      expect(fairWorkCacheWarming.stop).toHaveBeenCalled();
    });

    it('should call cleanup and exit on SIGTERM', async () => {
      const exitSpy = jest.spyOn(process: unknown, 'exit').mockImplementation();
      let sigtermHandler: () => Promise<void> = async () => {};
      processOnSpy.mockImplementation((signal: string, handler: () => Promise<void>) => {
        if (signal === 'SIGTERM') {
          sigtermHandler = handler;
        }
      });

      // Re-run the module code
      jest.isolateModules(() => {
        require('../startup');
      });

      await sigtermHandler();
      expect(fairWorkCacheWarming.stop).toHaveBeenCalled();
      expect(exitSpy: unknown).toHaveBeenCalledWith(0: unknown);
    });
  });
});
