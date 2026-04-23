<template>
  <div>
    <div style="margin-bottom: 24px;">
      <h2>事件流可视化 (Event Flow) <a-tag color="processing">Phase 2 规划中</a-tag></h2>
      <p style="color: #666;">展示基于 EventRouter 约定的跨 Cell 异步事件传播网络。动态监控能力（订阅流速度、积压等）将在后续版本接入。</p>
    </div>
    
    <a-alert
      message="当前为概念静态版"
      description="该页面目前仅展示设想的概念视图。动态事件流监控需后续版本联调真实的 WebSocket 指标流 API。"
      type="info"
      show-icon
      style="margin-bottom: 24px;"
    />

    <a-card style="min-height: 500px; display: flex; align-items: center; justify-content: center; background: #fafafa;">
      <a-empty
        image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
        description="事件流实时拓扑 (开发中)"
      >
      </a-empty>
    </a-card>
  </div>
</template>
