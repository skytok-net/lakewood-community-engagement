# Stage 1: Base image
FROM node:20-alpine AS base

# Set PNPM_HOME and update PATH
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME/bin:$PATH

# Install pnpm
RUN npm install -g pnpm@latest

# Set the working directory inside the container
WORKDIR /app

# Stage 2: Dependencies
FROM base AS deps

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Generate required UI components
RUN pnpm dlx shadcn@latest add skeleton avatar button textarea

# Stage 3: Build the application
FROM base AS builder

# Copy files needed for build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set Next.js telemetry to disabled
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js application
RUN pnpm build

# Stage 4: Production image
FROM base AS runner

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# Set the working directory
WORKDIR /app

# Copy necessary files from the builder stage
COPY --from=builder --chown=nextjs:nextjs /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose the port the app will run on
EXPOSE 3000

# Set hostname for the container
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]
