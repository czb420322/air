<template>
  <div class="config-page">
    <div class="config-tabs">
      <button type="button" class="config-tab active">电价配置</button>
    </div>

    <div class="config-content">
      <div class="price-form-panel">
        <div class="section-title">电价配置</div>

        <div class="form-row radio-row">
          <span class="field-label required">电度电价类型：</span>
          <label class="radio-item">
            <input v-model="priceType" type="radio" value="fixed">
            <span>固定电价</span>
          </label>
          <label class="radio-item">
            <input v-model="priceType" type="radio" value="time">
            <span>分时电价</span>
          </label>
        </div>

        <div class="form-grid">
          <div class="form-item wide">
            <span class="field-label required">生效日期：</span>
            <el-date-picker
              v-model="effectiveDate"
              type="date"
              placeholder="请选择日期"
              value-format="yyyy-MM-dd"
              format="yyyy年M月"
              popper-class="config-date-popper"
              class="config-date-picker"
            />
          </div>

          <div class="form-item wide">
            <span class="field-label">失效日期：</span>
            <el-date-picker
              v-model="expiryDate"
              type="date"
              placeholder="不填即是永久生效"
              value-format="yyyy-MM-dd"
              format="yyyy年M月"
              popper-class="config-date-popper"
              class="config-date-picker"
            />
          </div>
        </div>

        <div v-if="priceType === 'fixed'" class="form-row price-row">
          <span class="field-label required">电价（元/kWh）：</span>
          <input v-model="priceValue" type="text" class="price-input">
          <span>元</span>
        </div>

        <template v-else>
          <div class="time-price-panel-title">时段电价(元/kWh)</div>
          <div class="time-price-row">
            <div class="time-price-item"><span>尖：</span><input v-model="timePriceForm.peak" type="text" class="price-input"><span>元</span></div>
            <div class="time-price-item"><span>峰：</span><input v-model="timePriceForm.high" type="text" class="price-input"><span>元</span></div>
            <div class="time-price-item"><span>平：</span><input v-model="timePriceForm.flat" type="text" class="price-input"><span>元</span></div>
            <div class="time-price-item"><span>谷：</span><input v-model="timePriceForm.low" type="text" class="price-input"><span>元</span></div>
            <div class="time-price-item"><span>深：</span><input v-model="timePriceForm.deep" type="text" class="price-input"><span>元</span></div>
          </div>

          <div class="time-detail-header left-panel-time-header">
            <span class="time-detail-title">时段详情 <em>所有时段不能有重复，且组合后必须涵盖全天24小时</em></span>
            <button type="button" class="primary-btn add-period-btn" @click="addTimePeriod">添加时段</button>
          </div>

          <table class="time-period-table">
            <thead>
              <tr>
                <th>时段</th>
                <th>电价类型</th>
                <th>单价(元/kWh)</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="period in timePeriods" :key="period.id">
                <td>
                  <div class="time-range-cell">
                    <el-time-select
                      v-model="period.startTime"
                      placeholder="开始时间"
                      :picker-options="{ start: '00:00', step: '00:30', end: '23:30' }"
                    />
                    <span>~</span>
                    <el-time-select
                      v-model="period.endTime"
                      placeholder="结束时间"
                      :picker-options="{ start: '00:30', step: '00:30', end: '24:00', minTime: period.startTime }"
                    />
                  </div>
                </td>
                <td>
                  <el-select v-model="period.type" placeholder="请选择" class="period-type-select">
                    <el-option label="尖" value="peak" />
                    <el-option label="峰" value="high" />
                    <el-option label="平" value="flat" />
                    <el-option label="谷" value="low" />
                    <el-option label="深" value="deep" />
                  </el-select>
                </td>
                <td>{{ getPeriodPrice(period.type) }}</td>
                <td class="period-action">
                  <i v-if="timePeriods.length > 1" class="el-icon-delete" @click="deleteTimePeriod(period.id)"></i>
                </td>
              </tr>
            </tbody>
          </table>
        </template>

        <div class="submit-row left-submit-row">
          <button type="button" class="primary-btn">确定</button>
        </div>
      </div>

      <div class="price-table-panel">
        <div class="table-title">周期电价</div>
        <table class="price-table">
          <thead>
            <tr>
              <th>周期</th>
              <th>电价（元/kWh）</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in periodPrices" :key="item.id">
              <td>{{ item.period }}</td>
              <td class="price-link">{{ item.price }}</td>
              <td class="action-icons">
                <i class="el-icon-edit-outline" @click="editPeriodPrice(item)"></i>
                <i class="el-icon-delete" @click="openDeleteDialog(item)"></i>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <el-dialog
      :visible.sync="showPriceDialog"
      width="700px"
      custom-class="price-config-dialog"
      :show-close="false"
      append-to-body
    >
      <div class="dialog-header">
        <span class="dialog-title">配置电价</span>
        <button type="button" class="dialog-close" @click="showPriceDialog = false">×</button>
      </div>

      <div class="dialog-body">
        <div class="form-row radio-row">
          <span class="field-label required">电度电价类型：</span>
          <label class="radio-item">
            <input v-model="priceType" type="radio" value="fixed">
            <span>固定电价</span>
          </label>
          <label class="radio-item">
            <input v-model="priceType" type="radio" value="time">
            <span>分时电价</span>
          </label>
        </div>

        <div class="form-grid">
          <div class="form-item wide">
            <span class="field-label required">生效日期：</span>
            <el-date-picker
              v-model="effectiveDate"
              type="date"
              placeholder="请选择日期"
              value-format="yyyy-MM-dd"
              format="yyyy年M月"
              popper-class="config-date-popper"
              class="config-date-picker"
            />
          </div>

          <div class="form-item wide">
            <span class="field-label">失效日期：</span>
            <el-date-picker
              v-model="expiryDate"
              type="date"
              placeholder="不填即是永久生效"
              value-format="yyyy-MM-dd"
              format="yyyy年M月"
              popper-class="config-date-popper"
              class="config-date-picker"
            />
          </div>
        </div>

        <div v-if="priceType === 'fixed'" class="form-row price-row">
          <span class="field-label required">电价（元/kWh）：</span>
          <input v-model="priceValue" type="text" class="price-input">
          <span>元</span>
        </div>

        <template v-else>
          <div class="time-price-row">
            <div class="time-price-item"><span>尖：</span><input v-model="timePriceForm.peak" type="text" class="price-input"><span>元</span></div>
            <div class="time-price-item"><span>峰：</span><input v-model="timePriceForm.high" type="text" class="price-input"><span>元</span></div>
            <div class="time-price-item"><span>平：</span><input v-model="timePriceForm.flat" type="text" class="price-input"><span>元</span></div>
            <div class="time-price-item"><span>谷：</span><input v-model="timePriceForm.low" type="text" class="price-input"><span>元</span></div>
            <div class="time-price-item"><span>深：</span><input v-model="timePriceForm.deep" type="text" class="price-input"><span>元</span></div>
          </div>

          <div class="time-detail-header">
            <span class="time-detail-title">时段详情 <em>所有时段不能有重复，且组合后必须涵盖全天24小时</em></span>
            <button type="button" class="primary-btn add-period-btn" @click="addTimePeriod">添加时段</button>
          </div>

          <table class="time-period-table">
            <thead>
              <tr>
                <th>时段</th>
                <th>电价类型</th>
                <th>单价(元/kWh)</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="period in timePeriods" :key="period.id">
                <td>
                  <div class="time-range-cell">
                    <el-time-select
                      v-model="period.startTime"
                      placeholder="开始时间"
                      :picker-options="{ start: '00:00', step: '00:30', end: '23:30' }"
                    />
                    <span>~</span>
                    <el-time-select
                      v-model="period.endTime"
                      placeholder="结束时间"
                      :picker-options="{ start: '00:30', step: '00:30', end: '24:00', minTime: period.startTime }"
                    />
                  </div>
                </td>
                <td>
                  <el-select v-model="period.type" placeholder="请选择" class="period-type-select">
                    <el-option label="尖" value="peak" />
                    <el-option label="峰" value="high" />
                    <el-option label="平" value="flat" />
                    <el-option label="谷" value="low" />
                    <el-option label="深" value="deep" />
                  </el-select>
                </td>
                <td>{{ getPeriodPrice(period.type) }}</td>
                <td class="period-action">
                  <i v-if="timePeriods.length > 1" class="el-icon-delete" @click="deleteTimePeriod(period.id)"></i>
                </td>
              </tr>
            </tbody>
          </table>
        </template>
      </div>

      <div class="dialog-footer">
        <button type="button" class="secondary-btn" @click="showPriceDialog = false">取消</button>
        <button type="button" class="primary-btn">确定</button>
      </div>
    </el-dialog>

    <el-dialog
      :visible.sync="showDeleteDialog"
      width="360px"
      custom-class="delete-confirm-dialog"
      :show-close="false"
      append-to-body
    >
      <div class="dialog-header delete-header">
        <span class="dialog-title">确认删除</span>
        <button type="button" class="dialog-close" @click="showDeleteDialog = false">×</button>
      </div>

      <div class="delete-message">删除电价后数据将无法恢复，是否确认删除？</div>

      <div class="dialog-footer">
        <button type="button" class="secondary-btn" @click="showDeleteDialog = false">取消</button>
        <button type="button" class="primary-btn" @click="confirmDeletePrice">确定</button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ConfigPage',
  data() {
    return {
      priceType: 'fixed',
      effectiveDate: '',
      expiryDate: '',
      priceValue: '0.80',
      showPriceDialog: false,
      showDeleteDialog: false,
      deletingPriceId: '',
      editingPriceId: '',
      timePriceForm: {
        peak: '1.00',
        high: '1.00',
        flat: '1.00',
        low: '1.00',
        deep: '1.00'
      },
      timePeriods: [
        {
          id: 'period-1',
          startTime: '',
          endTime: '',
          type: ''
        }
      ],
      periodPrices: [
        {
          id: 'price-1',
          period: '2025-12-01 ~ 永久',
          price: '0.80',
          effectiveDate: '2025-12-01',
          expiryDate: ''
        }
      ]
    }
  },
  methods: {
    addTimePeriod() {
      this.timePeriods.push({
        id: `period-${Date.now()}`,
        startTime: '',
        endTime: '',
        type: ''
      })
    },
    deleteTimePeriod(id) {
      this.timePeriods = this.timePeriods.filter(period => period.id !== id)
    },
    getPeriodPrice(type) {
      if (!type) return '0.00'
      return this.timePriceForm[type] || '0.00'
    },
    openDeleteDialog(item) {
      this.deletingPriceId = item.id
      this.showDeleteDialog = true
    },
    confirmDeletePrice() {
      this.periodPrices = this.periodPrices.filter(item => item.id !== this.deletingPriceId)
      this.showDeleteDialog = false
      this.deletingPriceId = ''
    },
    editPeriodPrice(item) {
      this.editingPriceId = item.id
      this.priceValue = item.price
      this.effectiveDate = item.effectiveDate || ''
      this.expiryDate = item.expiryDate || ''
      this.priceType = 'fixed'
      this.showPriceDialog = true
    }
  }
}
</script>

<style lang="scss" scoped>
.config-page {
  min-height: calc(100vh - 125px);
  background: #fff;
}

.config-tabs {
  display: flex;
  border-bottom: 1px solid #edf0f5;
}

.config-tab {
  min-width: 108px;
  height: 48px;
  border: 0;
  background: #fff;
  color: #30415e;
  font-size: 14px;
  cursor: pointer;
}

.config-tab.active {
  color: #1d2a44;
  font-weight: 600;
  border-bottom: 2px solid #2d63ff;
}

.config-content {
  display: grid;
  grid-template-columns: 1.45fr 1fr;
  min-height: calc(100vh - 174px);
}

.price-form-panel {
  padding: 18px 20px 0 8px;
}

.section-title,
.table-title {
  margin-bottom: 24px;
  color: #1d2a44;
  font-size: 16px;
  font-weight: 700;
}

.form-row,
.form-item,
.radio-item,
.submit-row {
  display: flex;
  align-items: center;
}

.radio-row {
  gap: 16px;
  margin-bottom: 28px;
}

.field-label {
  color: #30415e;
  font-size: 14px;
  white-space: nowrap;
}

.field-label.required::before {
  content: '*';
  margin-right: 2px;
  color: #ff4d4f;
}

.radio-item {
  gap: 8px;
  color: #30415e;
  font-size: 14px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  margin-bottom: 24px;
}

.form-item.wide {
  min-width: 0;
}

.config-date-picker {
  width: 100%;
}

.price-row {
  gap: 12px;
}

.price-input {
  width: 80px;
  height: 30px;
  padding: 0 12px;
  border: 1px solid #9fb5dc;
  border-radius: 4px;
  color: #30415e;
}

.submit-row {
  justify-content: flex-end;
  margin-top: 40px;
}

.left-submit-row {
  margin-top: 24px;
}

.primary-btn {
  min-width: 64px;
  height: 32px;
  border: 0;
  border-radius: 4px;
  background: #2d63ff;
  color: #fff;
  cursor: pointer;
}

.price-table-panel {
  padding: 18px 20px;
}

.price-table {
  width: 100%;
  border-collapse: collapse;
}

.price-table th,
.price-table td {
  padding: 14px 18px;
  text-align: left;
  border-bottom: 1px solid #edf0f5;
  color: #30415e;
  font-size: 14px;
  font-weight: 400;
}

.price-table th {
  background: #f8f9fb;
  color: #7b8ba8;
}

.price-link {
  color: #2d63ff !important;
}

.action-icons {
  color: #2d63ff;

  i {
    margin-right: 14px;
    cursor: pointer;
  }
}

.dialog-header,
.dialog-footer,
.time-detail-header,
.time-range-cell,
.time-price-row,
.time-price-item {
  display: flex;
  align-items: center;
}

.dialog-header {
  justify-content: space-between;
  margin-bottom: 24px;
}

.delete-header {
  margin-bottom: 16px;
}

.dialog-title {
  color: #1d2a44;
  font-size: 16px;
  font-weight: 700;
}

.dialog-close {
  border: 0;
  background: transparent;
  color: #7b8ba8;
  font-size: 24px;
  cursor: pointer;
}

.dialog-body {
  padding: 0 12px;
}

.delete-message {
  padding: 0 12px;
  color: #30415e;
  font-size: 14px;
  line-height: 22px;
}

.time-price-panel-title {
  margin-bottom: 16px;
  color: #30415e;
  font-size: 14px;
}

.time-price-row {
  gap: 18px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.time-price-item {
  gap: 8px;
  color: #30415e;
}

.time-detail-header {
  justify-content: space-between;
  margin: 20px 0 12px;
}

.time-detail-title {
  color: #30415e;
  font-size: 14px;

  em {
    color: #7b8ba8;
    font-style: normal;
    font-size: 12px;
  }
}

.add-period-btn {
  min-width: 96px;
}

.time-period-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 24px;

  th,
  td {
    padding: 12px 16px;
    border: 1px solid #edf0f5;
    color: #30415e;
    font-size: 14px;
    text-align: left;
  }

  th {
    background: #f8f9fb;
    color: #7b8ba8;
    font-weight: 400;
  }
}

.time-range-cell {
  gap: 8px;
}

.period-type-select {
  width: 120px;
}

.period-action {
  color: #ff4d4f;

  i {
    cursor: pointer;
  }
}

.secondary-btn {
  min-width: 64px;
  height: 32px;
  border: 0;
  border-radius: 4px;
  background: #e8f1ff;
  color: #2d63ff;
  cursor: pointer;
}

.dialog-footer {
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 12px 0;
}
</style>

<style lang="scss">
.config-date-popper {
  .el-date-picker__header-label,
  .el-month-table td .cell,
  .el-year-table td .cell,
  .el-date-table th {
    color: #30415e;
  }

  .el-date-picker__header-label {
    font-size: 28px;
    font-weight: 600;
  }
}
</style>
