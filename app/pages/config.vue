<template>

  <div class="flex ">
    <el-form-item label="GRPC URL">
      <el-input v-model="configGrpcUrl" style="width: 300px" class="mr-5"/>
    </el-form-item>
    <el-button type="primary" @click="handleRefreshUrl">刷新</el-button>
  </div>

  <div class="flex flex-col  justify-center ">
    <el-card class="mt-10">
      <template #header>
        <div class="flex justify-between">
          <h1>配置</h1>
          <div>
            <el-button v-if="!disabled" type="primary" @click="disabled = true">取消</el-button>
            <el-button type="primary" @click="handleClick" :loading="updateLoading" :disabled="false">
              {{ disabled ? '编辑' : '更新' }}
            </el-button>
          </div>
        </div>
      </template>
      <div class="flex justify-center ">
        <el-form :model="form" label-width="auto" :disabled="disabled">
          <el-form-item label="是否开启买卖">
            <el-switch v-model="form.buy_enabled"/>
          </el-form-item>
          <el-form-item label="买入最大 SOL">
            <el-input-number v-model="form.max_sol"/>
          </el-form-item>
          <el-form-item label="是否启用白名单">
            <el-switch v-model="form.whitelist_enabled"/>
          </el-form-item>
          <el-form-item label="Jito 小费">
            <el-input-number v-model="form.jito_fee"/>
          </el-form-item>
          <el-form-item label="0slot 买入小费">
            <el-input-number v-model="form.zero_slot_buy_fee"/>
          </el-form-item>
          <el-form-item label="0slot 卖出小费">
            <el-input-number v-model="form.zero_slot_sell_fee"/>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card class="mt-10">
      <template #header>
        <div class="flex justify-between">
          <h1>白名单查询配置</h1>
          <div>
            <el-button v-if="!whitelistDisabled" type="primary" @click="whitelistDisabled = true">取消</el-button>
            <el-button type="primary" @click="handleWhitelistUpdate" :loading="whitelistUpdateLoading"
                       :disabled="false">
              {{ whitelistDisabled ? '编辑' : '更新' }}
            </el-button>
          </div>
        </div>
      </template>
      <div class="flex justify-center ">
        <el-form :model="whitelistForm" label-width="auto" :disabled="whitelistDisabled">
          <el-form-item label="总盈利">
            <el-input-number v-model="whitelistForm.profit"/>
          </el-form-item>
          <el-form-item label="平均持仓时间">
            <el-input-number v-model="whitelistForm.avg"/>
          </el-form-item>
          <el-form-item label="发币次数">
            <el-input-number v-model="whitelistForm.count"/>
          </el-form-item>
          <el-form-item label="容错">
            <el-input-number v-model="whitelistForm.mid"/>
          </el-form-item>
          <el-form-item label="5 秒砸盘次数">
            <el-input-number v-model="whitelistForm.hold_less_5_sec_count"/>
          </el-form-item>
          <el-form-item label="最低持币时间">
            <el-input-number v-model="whitelistForm.min_hold"/>
          </el-form-item>
          <el-form-item label="平均参与地址">
            <el-input-number v-model="whitelistForm.avg_user"/>
          </el-form-item>
          <el-form-item label="平均前 3 买入金额">
            <el-input-number v-model="whitelistForm.top_3_buy"/>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card class="mt-10">
      <template #header>
        <div class="flex justify-between">
          <h1>黑名单</h1>
          <el-button type="primary" @click="dialogVisible = true">添加</el-button>
        </div>
      </template>
      <div class="flex justify-center">
        <el-table :data="tableData" style="width: 100%">
          <el-table-column label="Dev 地址">
            <!-- scope.row 即为数组中的元素本身 -->
            <template #default="scope">
              {{ scope.row }}
            </template>
          </el-table-column>
          <el-table-column label="Operations">
            <template #default="scope">

              <el-popconfirm
                  title="确定要删除吗?"
                  placement="top-start"
                  @confirm="handleDelete(scope.row)"
              >
                <template #reference>
                  <el-button
                      size="small"
                      type="danger"
                  >
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-dialog
        v-model="dialogVisible"
        title="黑名单"
        width="500"
    >
      <el-input v-model="newBlacklistItem"/>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAddBlacklist">
            添加
          </el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script lang="ts" setup>
import {useGrpcStore} from "~/stores/grpc";

definePageMeta({
  layout: 'home',
})

import {reactive} from 'vue'

const grpcStore = useGrpcStore()

const configGrpcUrl = computed({
  get() {
    return grpcStore.configUrl;
  },
  set(value) {
    grpcStore.setConfigUrl(value)
  }
});

const disabled = ref(true)
const whitelistDisabled = ref(true)
const updateLoading = ref(false)
const whitelistUpdateLoading = ref(false)
const dialogVisible = ref(false)
const newBlacklistItem = ref(null)

// do not use same name with ref
const form = reactive({
  buy_enabled: false,
  max_sol: 0,
  whitelist_enabled: false,
  jito_fee: 0,
  zero_slot_buy_fee: 0,
  zero_slot_sell_fee: 0,
})
const whitelistForm = reactive({
  profit: 0,
  avg: 0,
  count: 0,
  mid: 0,
  hold_less_5_sec_count: 0,
  min_hold: 0,
  avg_user: 0,
  top_3_buy: 0,
})

const tableData = ref([] as string[])


const handleAddBlacklist = async () => {
  const result = await $fetch(`/api/config/blacklist?grpc_url=${grpcStore.configUrl}`, {
    method: 'PUT',
    body: {
      item: newBlacklistItem.value
    }
  });

  console.log(result)

  if (result.result == 'ok') {
    await reloadBlacklist()
    disabled.value = true
    ElMessage.success("添加成功");
    dialogVisible.value = false
  } else {
    ElMessage.success("添加失败");
  }
}

const handleDelete = async (address: string) => {
  const result = await $fetch(`/api/config/blacklist?grpc_url=${grpcStore.configUrl}`, {
    method: 'DELETE',
    body: {
      item: address
    }
  });

  if (result.result == 'ok') {
    await reloadBlacklist()
    disabled.value = true
    ElMessage.success("删除成功");
  } else {
    ElMessage.success("删除失败");
  }
}
const handleClick = async () => {
  if (disabled.value) {
    disabled.value = false
    return
  }

  const result = await $fetch(`/api/config/config?grpc_url=${grpcStore.configUrl}`, {
    method: 'PUT',
    body: form
  });

  if (result.result == 'ok') {
    disabled.value = true
    ElMessage.success("更新成功");
  } else {
    ElMessage.success("更新失败");
  }
}

const handleWhitelistUpdate = async () => {
  if (whitelistDisabled.value) {
    whitelistDisabled.value = false
    return
  }

  const result = await $fetch(`/api/config/whitelist?grpc_url=${grpcStore.configUrl}`, {
    method: 'PUT',
    body: whitelistForm
  });

  if (result.result == 'ok') {
    whitelistDisabled.value = true
    ElMessage.success("更新成功");
  } else {
    ElMessage.success("更新失败");
  }
}

const reloadBlacklist = async () => {
  const blacklist = await $fetch(`/api/config/blacklist?grpc_url=${grpcStore.configUrl}`, {
    method: 'GET',
  });
  tableData.value = blacklist.items
}

const reloadConfig = async () => {
  const result = await $fetch(`/api/config/config?grpc_url=${grpcStore.configUrl}`, {
    method: 'GET',
  });

  form.max_sol = result.max_sol
  form.buy_enabled = result.buy_enabled
  form.whitelist_enabled = result.whitelist_enabled
  form.jito_fee = result.jito_fee
  form.zero_slot_buy_fee = result.zero_slot_buy_fee
  form.zero_slot_sell_fee = result.zero_slot_sell_fee
}

const reloadWhitelistConfig = async () => {
  const result = await $fetch(`/api/config/whitelist?grpc_url=${grpcStore.configUrl}`, {
    method: 'GET',
  });

  whitelistForm.profit = result.profit
  whitelistForm.avg = result.avg
  whitelistForm.count = result.count
  whitelistForm.mid = result.mid
  whitelistForm.hold_less_5_sec_count = result.hold_less_5_sec_count
  whitelistForm.min_hold = result.min_hold
  whitelistForm.avg_user = result.avg_user
  whitelistForm.top_3_buy = result.top_3_buy
}

const handleRefreshUrl = async () => {
  await reloadConfig()
  await reloadBlacklist()
  await reloadWhitelistConfig()
}

onMounted(async () => {
  await handleRefreshUrl()
})
</script>