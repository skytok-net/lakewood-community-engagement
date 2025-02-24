FROM oven/bun:1 AS base

WORKDIR /run

# First copy only config files
COPY tsconfig.json next.config.mjs .bunfig.toml ./

# Then copy package files
COPY package.json bun.lock ./

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# Copy remaining files with proper ownership
COPY --chown=1000:1000 . .

# Verify file structure
RUN ls -lR components/ && ls -l .bunfig.toml

ARG FIREWORKS_API_KEY
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build


# Stage 2: Production image
FROM oven/bun:1-slim AS runner

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV FIREWORKS_API_KEY=${FIREWORKS_API_KEY}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}

# Set the working directory
WORKDIR /run

# Copy necessary files from the builder stage
COPY --from=base /run/public ./public
COPY --from=base /run/.next/standalone ./
COPY --from=base /run/.next/static ./.next/static

# Create a non-root user
RUN adduser --system --group bun

# Set ownership
RUN chown -R bun:bun .

# Switch to non-root user
USER bun

# Expose the port the app will run on
EXPOSE 3000

# Set hostname for the container
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application using Bun
CMD ["bun", "server.js"]
