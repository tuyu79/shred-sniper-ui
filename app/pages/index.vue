<template>

  <el-form :inline="true" :model="formInline" class="demo-form-inline" :label-width="100" :label-position="'left'">
    <el-row>
      <el-col :span="24">
        <el-form-item label="总盈利">
          <el-input-number v-model="formInline.profit" :precision="1" :step="0.1" :min="0"/>
        </el-form-item>
        <el-form-item label="平均持仓时间">
          <el-input-number v-model="formInline.avg" :precision="1" :step="0.1" :min="0.1"/>
        </el-form-item>
        <el-form-item label="发币次数"  :label-width="150">
          <el-input-number v-model="formInline.count" :step="1"/>
        </el-form-item>
        <el-form-item label="容错">
          <el-input-number v-model="formInline.mid" :step="1"/>
        </el-form-item>
        <el-form-item label="5 秒砸盘次数">
          <el-input-number v-model="formInline.hold_less_5_sec_count" :step="1"/>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-form-item label="最低持币时间">
          <el-input-number v-model="formInline.min_hold" :precision="1" :step="0.1"/>
        </el-form-item>
        <el-form-item label="平均参与地址">
          <el-input-number v-model="formInline.avg_user" :step="1"/>
        </el-form-item>
        <el-form-item label="平均前 3 买入金额" :label-width="150">
          <el-input-number v-model="formInline.top_3_buy" :precision="1" :step="0.1"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit" :loading="queryLoading">Query</el-button>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>

  <el-table
      :data="filterTableData"
      style="width: 100%"
  >
    <el-table-column prop="token_creator" label="DEV地址" width="280">
      <template #header>
        <el-input v-model="search" size="small" placeholder="输入DEV地址过滤"/>
      </template>
      <template #default="scope">
        <span>{{ scope.row.token_creator }}</span>
        <el-icon @click="copyText(scope.row.token_creator)" class="clickable-icon">
          <CopyDocument/>
        </el-icon>
      </template>
    </el-table-column>
    <el-table-column prop="token_count" label="发币次数" sortable/>
    <el-table-column prop="avg_holding_seconds" label="整体评分" sortable :formatter="numberFormatter"/>
    <el-table-column prop="avg_users_per_token" label="平均参与钱包" sortable :formatter="numberFormatter"/>
    <el-table-column prop="avg_holding_seconds" label="平均持仓时间" :formatter="numberFormatter"/>
    <el-table-column prop="total_profit_sol" label="总盈利(SOL)" sortable :formatter="numberFormatter"/>
    <el-table-column prop="profitability" label="收益率" sortable :formatter="numberFormatter"/>
    <el-table-column prop="win_rate" label="胜率" sortable :formatter="numberFormatter"/>
    <el-table-column prop="hold_less_5_sec_count" label="5秒内"/>
    <el-table-column prop="hold_greater_5_sec_count" label="5秒外"/>
    <el-table-column prop="mid_hold_count" label="容错持仓时间(5-10秒)"/>
    <el-table-column prop="min_holding_seconds" label="最低持仓时间" sortable/>
    <el-table-column prop="avg_top3_buy_per_token" label="平均前三买入总额" sortable
                     :formatter="numberFormatter"/>
    <el-table-column prop="latest_trade_time" label="最后一笔交易" sortable :formatter="timeDiffFormatter"/>
  </el-table>
</template>

<script lang="ts" setup>

import {CopyDocument} from "@element-plus/icons-vue";

definePageMeta({
  layout: 'home',
})

import {reactive, ref} from 'vue'
import {copy} from "copy-anything";
import type {TableColumnCtx} from "element-plus";

interface DogHost {
  token_creator: string;
  token_count: number;
  avg_holding_seconds: number;
  total_profit_sol: number;
  hold_less_5_sec_count: number;
  hold_greater_5_sec_count: number;
  mid_hold_count: number;
  min_holding_seconds: number;
  win_rate: number;
  latest_trade_time: number;
  positive_dev_profit: number;
  positive_dev_initial_buy: number;
  profitability: number;
  avg_users_per_token: number;
  avg_top3_buy_per_token: number;
}

const formInline = reactive({
  profit: 0.1,
  avg: 10,
  count: 1,
  mid: 2,
  hold_less_5_sec_count: 10,
  min_hold: 5,
  avg_user: 10,
  top_3_buy: 1
})

const tableData = ref([] as DogHost[])
const addressFilters = ref([] as { text: string, value: string }[])
const queryLoading = ref(false)
const search = ref('')

const filterTableData = computed(() =>
    tableData.value.filter(
        (data) =>
            !search.value ||
            data.token_creator.toLowerCase().includes(search.value.toLowerCase())
    )
)

const copyText = (text: string) => {
  navigator.clipboard.writeText(text)
      .then(() => ElMessage.success('复制成功'))
      .catch(() => ElMessage.error('复制失败'));
};

const numberFormatter = (row: any, column: any, cellValue: any, index: number) => {
  return (cellValue as number).toFixed(2)
}

const getTimeDiff = (targetTimestamp: number) => {
  // 获取当前时间戳（秒）
  const now = Date.now() / 1000;
  // 计算毫秒差值（取绝对值，忽略过去/未来差异）
  const diffMs = Math.abs(now - targetTimestamp);

  // 转换为各单位
  const seconds = Math.floor(diffMs);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  // 返回剩余的更小单位（如：1天2小时，而非26小时）
  return {
    days: days,
    hours: hours % 24,    // 剩余小时（0-23）
    minutes: minutes % 60, // 剩余分钟（0-59）
    seconds: seconds % 60  // 剩余秒（0-59）
  };
}

const timeDiffFormatter = (row: DogHost) => {
  const timestamp = row.latest_trade_time;
  const diff = getTimeDiff(timestamp);
  const units = [
    {unit: '天', value: diff.days},
    {unit: '小时', value: diff.hours},
    {unit: '分钟', value: diff.minutes},
    {unit: '秒', value: diff.seconds}
  ];

  // 过滤掉值为0的单位
  const nonZeroUnits = units.filter(item => item.value > 0);

  // 没有非零单位（时间差为0）
  if (nonZeroUnits.length === 0) {
    return '刚刚';
  }

  // 取前两个非零单位（如“3天2小时”）
  const parts = nonZeroUnits.slice(0, 2).map(item => `${item.value}${item.unit}`);
  return `${parts.join('')}前`;
}

const filterHandler = (
    value: string,
    row: DogHost,
    column: TableColumnCtx<DogHost>
) => {
  const property = column['property']
  return row[property] === value
}

const fetchData = async () => {
  try {
    queryLoading.value = true
    // 请求后端 API（示例：Nuxt 自身的 API 路由）
    const result = await $fetch('/api/whitelist', {
      method: 'POST',
      body: formInline
    });
    // console.log("收到数据, ", result.filtered_items)
    tableData.value = result.filtered_items
    addressFilters.value = result.filtered_creators.map(item => ({
      text: item,
      value: item
    }))
  } catch (err) {
    console.log("请求数据失败", err)
    ElMessage.error("请求数据失败!")
  } finally {
    queryLoading.value = false
  }
};

const onSubmit = () => {
  fetchData()
}
</script>

<style scoped>

.clickable-icon {
  margin-left: 10px;
}

.clickable-icon:hover {
  cursor: pointer;
}

.demo-form-inline .el-input {
  --el-input-width: 220px;
}

.demo-form-inline .el-select {
  --el-select-width: 220px;
}
</style>

