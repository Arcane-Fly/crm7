#!/usr/bin/env node

import axios from 'axios';
import { program } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { z } from 'zod';

const VERCEL_API = 'https://api.vercel.com/v1';
const DEPLOYMENT_HOOK = 'prj_ZcvIEwYIBFQBfbJafOjGuc2THSbA/MRewLE6RLO';

// Schema for environment variables
const EnvSchema = z.object({
  VERCEL_TOKEN: z.string().min(1),
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
  error: z.object({
    code: z.string(),
    message: z.string(),
  }).optional(),
});

interface DeploymentOptions {
  token?: string;
  timeout?: number;
  interval?: number;
}

async function triggerDeployment(token?: string) {
  const spinner = ora('Triggering deployment...').start();
  
  try {
    const response = await axios.post(
      `${VERCEL_API}/integrations/deploy/${DEPLOYMENT_HOOK}`
    );
    
    const data = DeploymentResponseSchema.parse(response.data);
    spinner.succeed('Deployment triggered successfully');
    return data.job.id;
  } catch (error) {
    spinner.fail('Failed to trigger deployment');
    if (axios.isAxiosError(error)) {
      console.error(chalk.red(`Error: ${error.response?.data?.message || error.message}`));
    } else {
      console.error(chalk.red(`Error: ${error}`));
    }
    process.exit(1);
  }
}

async function monitorDeployment(jobId: string, options: DeploymentOptions) {
  const { token, timeout = 300, interval = 10 } = options;
  const maxAttempts = Math.floor(timeout / interval);
  let attempt = 0;
  
  // Validate token
  if (token) {
    try {
      EnvSchema.parse({ VERCEL_TOKEN: token });
    } catch (error) {
      console.error(chalk.red('Invalid Vercel token'));
      process.exit(1);
    }
  }
  
  const spinner = ora('Monitoring deployment status...').start();
  
  while (attempt < maxAttempts) {
    try {
      const response = await axios.get(
        `${VERCEL_API}/deployments/${jobId}`,
        token ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        } : undefined
      );
      
      const deployment = DeploymentStatusSchema.parse(response.data);
      
      switch (deployment.state) {
        case 'READY':
          spinner.succeed(chalk.green('Deployment successful! 🚀'));
          console.log(chalk.cyan(`\nDeployment URL: ${deployment.url}`));
          console.log(chalk.gray(`Deployment ID: ${deployment.id}`));
          console.log(chalk.gray(`Created: ${new Date(deployment.created).toLocaleString()}`));
          console.log(chalk.gray(`Ready: ${deployment.ready ? new Date(deployment.ready).toLocaleString() : 'N/A'}`));
          return;
          
        case 'ERROR':
          spinner.fail(chalk.red('Deployment failed! ❌'));
          console.error(chalk.red(`\nError: ${deployment.error?.message}`));
          console.error(chalk.gray(`Error Code: ${deployment.error?.code}`));
          process.exit(1);
          
        default:
          spinner.text = `Deployment status: ${deployment.state}`;
      }
    } catch (error) {
      spinner.fail('Failed to check deployment status');
      if (axios.isAxiosError(error)) {
        console.error(chalk.red(`Error: ${error.response?.data?.message || error.message}`));
      } else {
        console.error(chalk.red(`Error: ${error}`));
      }
      process.exit(1);
    }
    
    attempt++;
    await new Promise(resolve => setTimeout(resolve, interval * 1000));
  }
  
  spinner.fail(chalk.yellow(`Deployment monitoring timed out after ${timeout} seconds`));
  process.exit(1);
}

// CLI setup
program
  .name('monitor-deployment')
  .description('Monitor Vercel deployments')
  .version('1.0.0');

program
  .command('trigger')
  .description('Trigger a new deployment')
  .action(async () => {
    const jobId = await triggerDeployment();
    console.log(chalk.cyan(`\nDeployment Job ID: ${jobId}`));
  });

program
  .command('monitor')
  .description('Monitor an existing deployment')
  .argument('<jobId>', 'Deployment job ID')
  .option('-t, --token <token>', 'Vercel API token')
  .option('--timeout <seconds>', 'Monitoring timeout in seconds', '300')
  .option('--interval <seconds>', 'Check interval in seconds', '10')
  .action(async (jobId, options) => {
    await monitorDeployment(jobId, {
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
  .action(async (options) => {
    const jobId = await triggerDeployment();
    console.log(chalk.cyan(`\nDeployment Job ID: ${jobId}`));
    await monitorDeployment(jobId, {
      token: options.token,
      timeout: parseInt(options.timeout),
      interval: parseInt(options.interval),
    });
  });

program.parse();
