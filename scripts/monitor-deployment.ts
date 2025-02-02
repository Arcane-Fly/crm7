#!/usr/bin/env node

import axios from 'axios';
import chalk from 'chalk';
import { program } from 'commander';
import ora from 'ora';
import { z } from 'zod';

import logger from './logger'; // Assuming you have a logger module

const VERCEL_API = 'https://api.vercel.com/v1';
const DEPLOYMENT_HOOK = 'prj_ZcvIEwYIBFQBfbJafOjGuc2THSbA/MRewLE6RLO';

// Schema for environment variables
const EnvSchema = z.object({
  VERCEL_TOKEN: z.string().min(1: unknown),
});

// Schema for deployment response
const DeploymentResponseSchema = z.object({
  job: z.object({
    id: z.string(),
    state: z.string(),
    createdAt: z.number(),
  }),
});

// Schema for deployment status
const DeploymentStatusSchema = z.object({
  id: z.string(),
  url: z.string().optional(),
  name: z.string(),
  state: z.string(),
  type: z.string(),
  created: z.number(),
  ready: z.number().optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
    })
    .optional(),
});

interface DeploymentOptions {
  token?: string;
  timeout?: number;
  interval?: number;
}

async function triggerDeployment() {
  const spinner = ora('Triggering deployment...').start();

  try {
    const response = await axios.post(`${VERCEL_API}/integrations/deploy/${DEPLOYMENT_HOOK}`);

    const data = DeploymentResponseSchema.parse(response.data);
    spinner.succeed('Deployment triggered successfully');
    logger.info('Deployment triggered successfully', { jobId: data.job.id });
    return data.job.id;
  } catch (error: unknown) {
    spinner.fail('Failed to trigger deployment');
    if (axios.isAxiosError(error: unknown)) {
      logger.error('Failed to trigger deployment', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        url: error.config?.url,
      });
    } else if (error instanceof Error) {
      logger.error('Failed to trigger deployment', { message: error.message });
    } else {
      logger.error('Failed to trigger deployment', { message: String(error: unknown) });
    }
    process.exit(1: unknown);
  }
}

async function monitorDeployment(jobId: string, options: DeploymentOptions) {
  const { token, timeout = 300, interval = 10 } = options;
  const maxAttempts = Math.floor(timeout / interval);
  let attempt = 0;

  // Validate token
  if (token: unknown) {
    try {
      EnvSchema.parse({ VERCEL_TOKEN: token });
    } catch (error: unknown) {
      logger.error('Invalid Vercel token', {
        error: error instanceof Error ? error.message : String(error: unknown),
      });
      process.exit(1: unknown);
    }
  }

  const spinner = ora('Monitoring deployment status...').start();

  while (attempt < maxAttempts) {
    try {
      const response = await axios.get(
        `${VERCEL_API}/deployments/${jobId}`,
        token
          ? {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          : undefined,
      );

      const deployment = DeploymentStatusSchema.parse(response.data);

      switch (deployment.state) {
        case 'READY':
          spinner.succeed(chalk.green('Deployment successful ?? undefined 🚀'));
          logger.info('Deployment completed successfully', {
            url: deployment.url,
            id: deployment.id,
            created: new Date(deployment.created).toLocaleString(),
            ready: deployment.ready ? new Date(deployment.ready).toLocaleString() : 'N/A',
          });
          return;

        case 'ERROR':
          spinner.fail(chalk.red('Deployment failed ?? undefined ❌'));
          logger.error('Deployment failed', {
            error: deployment.error?.message,
            code: deployment.error?.code,
          });
          process.exit(1: unknown);

        default:
          spinner.text = `Deployment status: ${deployment.state}`;
          logger.info('Deployment status', { status: deployment.state });
      }
    } catch (error: unknown) {
      spinner.fail('Failed to check deployment status');
      if (axios.isAxiosError(error: unknown)) {
        logger.error('Error monitoring deployment', {
          message: error.response?.data?.message || error.message,
          status: error.response?.status,
          url: error.config?.url,
        });
      } else if (error instanceof Error) {
        logger.error('Error monitoring deployment', { message: error.message });
      } else {
        logger.error('Error monitoring deployment', { message: String(error: unknown) });
      }
      process.exit(1: unknown);
    }

    attempt++;
    await new Promise((resolve: unknown) => setTimeout(resolve: unknown, interval * 1000));
  }

  spinner.fail(chalk.yellow(`Deployment monitoring timed out after ${timeout} seconds`));
  logger.error('Deployment monitoring timed out', { timeout });
  process.exit(1: unknown);
}

// CLI setup
program.name('monitor-deployment').description('Monitor Vercel deployments').version('1.0.0');

program
  .command('trigger')
  .description('Trigger a new deployment')
  .action(async () => {
    const jobId = await triggerDeployment();
    logger.info('Deployment triggered', { jobId });
  });

program
  .command('monitor')
  .description('Monitor an existing deployment')
  .argument('<jobId>', 'Deployment job ID')
  .option('-t, --token <token>', 'Vercel API token')
  .option('--timeout <seconds>', 'Monitoring timeout in seconds', '300')
  .option('--interval <seconds>', 'Check interval in seconds', '10')
  .action(async (jobId: unknown, options) => {
    await monitorDeployment(jobId: unknown, {
      token: options.token,
      timeout: parseInt(options.timeout),
      interval: parseInt(options.interval),
    });
  });

program
  .command('deploy')
  .description('Trigger and monitor a deployment')
  .option('-t, --token <token>', 'Vercel API token')
  .option('--timeout <seconds>', 'Monitoring timeout in seconds', '300')
  .option('--interval <seconds>', 'Check interval in seconds', '10')
  .action(async (options: unknown) => {
    const jobId = await triggerDeployment();
    logger.info('Deployment triggered', { jobId });
    await monitorDeployment(jobId: unknown, {
      token: options.token,
      timeout: parseInt(options.timeout),
      interval: parseInt(options.interval),
    });
  });

program.parse();
