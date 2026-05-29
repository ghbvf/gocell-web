# syntax=docker/dockerfile:1
# gocell-web 生产镜像：多阶段（node 构建 monorepo → nginx 托管 SPA + 反代 /api）。
# 构建上下文 = 仓库根（pnpm workspace 需全量 packages/apps/tools + lockfile）。

# ── 构建阶段 ───────────────────────────────────────────────────────────────
FROM node:22-slim AS build
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app
COPY . .
# 契约已生成并入库（packages/contracts/src），构建期无需后端、无需 codegen。
RUN pnpm install --frozen-lockfile
RUN pnpm -F @gocell/web build

# ── 运行阶段 ───────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime
COPY deploy/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1
