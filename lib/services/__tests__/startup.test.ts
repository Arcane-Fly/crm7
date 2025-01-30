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
      jest.spyOn(fairWorkCacheWarming, 'initialize').mockImplementationOnce(() => {
        throw error;
      });

      await expect(initializeServices()).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to initialize application services:',
        expect.any(Error),
      );
    });

    it('should handle unknown errors', async () => {
      const error = 'Unknown error occurred';
      jest.spyOn(fairWorkCacheWarming, 'initialize').mockImplementationOnce(() => {
        throw error;
      });

      await expect(initializeServices()).rejects.toBe(error);
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to initialize application services:',
        expect.any(Error),
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
      jest.spyOn(fairWorkCacheWarming, 'stop').mockImplementationOnce(() => {
        throw error;
      });

      await expect(cleanupServices()).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to cleanup application services:',
        expect.any(Error),
      );
    });

    it('should handle unknown cleanup errors', async () => {
      const error = 'Unknown cleanup error';
      jest.spyOn(fairWorkCacheWarming, 'stop').mockImplementationOnce(() => {
        throw error;
      });

      await expect(cleanupServices()).rejects.toBe(error);
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to cleanup application services:',
        expect.any(Error),
      );
    });
  });

  describe('Cleanup Handlers', () => {
    let addEventListenerSpy: jest.SpyInstance;
    let processOnSpy: jest.SpyInstance;

    beforeEach(() => {
      addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      processOnSpy = jest.spyOn(process, 'on');
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

      expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    });

    it('should register process cleanup handlers', () => {
      // Re-run the module code
      jest.isolateModules(() => {
        require('../startup');
      });

      expect(processOnSpy).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
      expect(processOnSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));
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
      if (beforeUnloadHandler) {
        await beforeUnloadHandler(mockEvent);
      }

      expect(fairWorkCacheWarming.stop).toHaveBeenCalled();
    });

    it('should call cleanup and exit on SIGTERM', async () => {
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation();
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
      expect(exitSpy).toHaveBeenCalledWith(0);
    });
  });
});
