<template>
  <div>
    <div style="margin-bottom: 24px;">
      <h2>Outbox 管道监控 (Outbox Monitor) <a-tag color="processing">Phase 2 规划中</a-tag></h2>
      <p style="color: #666;">用于监控 Transactional Outbox 模式中的待发送事件（Pending Outbox Entries）以及 Relay 组件的扫描与投递健康度。</p>
    </div>

    <a-alert
      message="当前为概念静态版"
      description="该页面仅为规划占位符。查看实际的 Relay 日志和队列积压状态需要后端提供统一监控端点支持。"
      type="warning"
      show-icon
      style="margin-bottom: 24px;"
    />

    <a-row :gutter="16" style="margin-bottom: 24px; opacity: 0.5; pointer-events: none;">
      <a-col :span="8">
        <a-card>
          <a-statistic title="Pending Events" :value="0" />
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card>
          <a-statistic title="Relay Rate (events/sec)" :value="0" />
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card>
          <a-statistic title="Dead Letter Queue" :value="0" valueStyle="color: #cf1322" />
        </a-card>
      </a-col>
    </a-row>

    <a-card style="min-height: 300px; display: flex; align-items: center; justify-content: center; background: #fafafa;">
      <a-empty
        image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
        description="Outbox Relay Pipeline 视图 (开发中)"
      >
      </a-empty>
    </a-card>
  </div>
</template>
