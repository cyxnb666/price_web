<template>
  <div>
    <t-card :bordered="false" class="list-card-container">
      <t-loading :loading="loading" text="加载中...">
        <div class="detail-container">
          <div class="section">
            <div class="section-header">
              <div class="section-title">
                <span class="section-title-marker"></span>
                <span>基础信息</span>
              </div>
              <t-button theme="default" variant="text" @click="toggleCollapse">
                {{ isCollapsed ? '展开' : '收起' }}
                <t-icon :name="isCollapsed ? 'chevron-down' : 'chevron-up'" />
              </t-button>
            </div>

            <div class="section-content" :class="{ 'collapsed': isCollapsed }">
              <t-row :gutter="[16, 16]">
                <t-col :span="4">
                  <div class="field-item">
                    <label>计划编号</label>
                    <t-input v-model="basicInfo.planId" disabled placeholder="" />
                  </div>
                </t-col>
                <t-col :span="4">
                  <div class="field-item">
                    <label>行政区划</label>
                    <div style="display: flex; gap: 8px;">
                      <t-input v-model="basicInfo.adminRegion" disabled placeholder="" style="flex: 1;" />
                      <t-button theme="default" variant="outline" size="medium" @click="handleViewRegion">查看</t-button>
                    </div>
                  </div>
                </t-col>
                <t-col :span="4">
                  <div class="field-item">
                    <label>采价点类型</label>
                    <t-input v-model="basicInfo.pointType" disabled placeholder="" />
                  </div>
                </t-col>
              </t-row>

              <t-row :gutter="[16, 16]">
                <t-col :span="4">
                  <div class="field-item">
                    <label>采价点归属</label>
                    <t-input v-model="basicInfo.pointAffiliation" disabled placeholder="" />
                  </div>
                </t-col>
                <t-col :span="4">
                  <div class="field-item">
                    <label>采价点客户标识</label>
                    <t-input v-model="basicInfo.customerIdentifier" disabled placeholder="" />
                  </div>
                </t-col>
                <t-col :span="4">
                  <div class="field-item">
                    <label>品种大类</label>
                    <t-input v-model="basicInfo.category" disabled placeholder="" />
                  </div>
                </t-col>
              </t-row>

              <t-row :gutter="[16, 16]" v-if="!isCollapsed">
                <t-col :span="4">
                  <div class="field-item">
                    <label>计划周期</label>
                    <t-input v-model="basicInfo.planPeriod" disabled placeholder="" />
                  </div>
                </t-col>
                <t-col :span="4">
                  <div class="field-item">
                    <label>上报周期(天)</label>
                    <t-input v-model="basicInfo.reportPeriod" disabled placeholder="" />
                  </div>
                </t-col>
                <t-col :span="4">
                  <div class="field-item">
                    <label>是否发送短信提醒</label>
                    <t-select v-model="basicInfo.sendSmsReminder" :options="smsReminderOptions" disabled />
                  </div>
                </t-col>
              </t-row>

              <t-row :gutter="[16, 16]" v-if="!isCollapsed">
                <t-col :span="4">
                  <div class="field-item">
                    <label>采价点</label>
                    <t-tooltip :content="basicInfo.selectedPoints" placement="top">
                      <t-input v-model="basicInfo.selectedPoints" disabled placeholder="" />
                    </t-tooltip>
                  </div>
                </t-col>
                <t-col :span="4">
                  <div class="field-item">
                    <label>创建人</label>
                    <t-input v-model="basicInfo.creator" disabled placeholder="" />
                  </div>
                </t-col>
                <t-col :span="4">
                  <div class="field-item">
                    <label>任务创建时间</label>
                    <t-input v-model="basicInfo.createTime" disabled placeholder="" />
                  </div>
                </t-col>
              </t-row>

              <t-row :gutter="[16, 16]" v-if="!isCollapsed">
                <t-col :span="4">
                  <div class="field-item">
                    <label>任务结束/终止时间</label>
                    <t-input v-model="basicInfo.endTime" disabled placeholder="" />
                  </div>
                </t-col>
                <t-col :span="4">
                  <div class="plan-terminate-btn">
                    <t-button theme="warning" :disabled="!basicInfo.canTerminate"
                      @click="handleTerminate">计划终止</t-button>
                  </div>
                </t-col>
              </t-row>
            </div>
          </div>

          <div class="section">
            <div class="section-title">
              <span class="section-title-marker"></span>
              <span>提醒列表</span>
            </div>

            <t-form ref="filterForm" :data="filterParams" :label-width="80" colon @reset="handleReset"
              @submit="handleSearch">
              <t-row :gutter="[16, 24]" :style="{ marginBottom: '10px' }">
                <t-col :span="3">
                  <t-form-item label="行政区划" name="areaCode">
                    <t-tree-select filterable clearable v-model="filterParams.areaCode" class="form-item-content"
                      :data="areaList" :treeProps="treeProps" placeholder="请选择行政区划" multiple />
                  </t-form-item>
                </t-col>
                <t-col :span="3">
                  <t-form-item label="采价点" name="pointId">
                    <t-select clearable v-model="filterParams.pointId" class="form-item-content" :options="pointOptions"
                      placeholder="请选择采价点" />
                  </t-form-item>
                </t-col>
                <t-col :span="3">
                  <t-form-item label="提醒状态" name="taskStatus">
                    <t-select clearable v-model="filterParams.taskStatus" class="form-item-content"
                      :options="taskStatusOptions" placeholder="请选择提醒状态" />
                  </t-form-item>
                </t-col>
                <t-col :span="3">
                  <div class="filter-actions">
                    <t-button theme="primary" type="submit">查询</t-button>
                    <t-button type="reset" variant="base" theme="default" :style="{ marginLeft: '8px' }">重置</t-button>
                  </div>
                </t-col>
              </t-row>
            </t-form>

            <div class="table-container">
              <t-table :columns="tableColumns" :data="tableData" :rowKey="rowKey" :verticalAlign="verticalAlign"
                :hover="hover" :pagination="pagination" :loading="tableLoading" :headerAffixedTop="true"
                height="calc(100vh - 580px)">

                <template #customerIdentifier="{ row }">
                  <span v-if="row.customerIdentifier && row.customerIdentifier.includes('客户')" style="color: #e34d59">
                    {{ row.customerIdentifier }}
                  </span>
                  <span v-else>{{ row.customerIdentifier || '' }}</span>
                </template>

                <template #status="{ row }">
                  <t-tag v-if="row.status === '0'" theme="primary" variant="light">待提醒</t-tag>
                  <t-tag v-else-if="row.status === '1'" theme="warning" variant="light">已提醒</t-tag>
                  <t-tag v-else-if="row.status === '2'" theme="success" variant="light">已上报</t-tag>
                  <t-tag v-else-if="row.status === '3'" theme="danger" variant="light">已终止</t-tag>
                </template>
                <template #op="slotProps">
                  <t-button theme="primary" variant="text" class="t-button-link"
                    style="color: #0052d9; padding: 0px 0px 10px 0px"
                    @click="handleViewTaskDetail(slotProps.row)">详情</t-button>
                </template>
              </t-table>
            </div>

            <div class="pagination">
              <t-pagination showFirstAndLastPageBtn :total="pagination.total" :default-current="pagination.pageNo"
                :default-page-size="pagination.pageSize" @current-change="onCurrentChange"
                @page-size-change="onPageSizeChange" />
            </div>
          </div>

          <div class="actions-container">
            <t-button theme="default" @click="goBack">返回</t-button>
          </div>
        </div>
      </t-loading>
    </t-card>

    <!-- 行政区划查看弹窗 -->
    <t-dialog header="查看行政区划" :visible.sync="regionDialogVisible" :closeOnOverlayClick="false" width="600px">
      <div class="region-tree-container">
        <t-tree :data="areaList" :keys="treeProps.keys" :value="selectedAreaCodes" :checkable="true" :activable="false"
          :expandOnClickNode="true" :hover="true" disabled
          style="height: 400px; overflow-y: auto; border: 1px solid #dcdcdc; border-radius: 4px; padding: 8px;" />
      </div>
      <template #footer>
        <t-button theme="default" @click="regionDialogVisible = false">关闭</t-button>
      </template>
    </t-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ChevronUpIcon, ChevronDownIcon } from 'tdesign-icons-vue';

export default Vue.extend({
  name: 'PriceLocationReportPlanDetail',
  components: {
    ChevronUpIcon,
    ChevronDownIcon
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      regionDialogVisible: false,
      areaList: [],
      selectedAreaCodes: [],
      loading: false,
      tableLoading: false,
      isCollapsed: false,

      basicInfo: {
        planId: '',
        adminRegion: '',
        pointType: '',
        pointAffiliation: '',
        customerIdentifier: '',
        category: '',
        planPeriod: '',
        reportPeriod: '',
        sendSmsReminder: true,
        selectedPoints: '',
        creator: '',
        createTime: '',
        endTime: '',
        canTerminate: false
      },

      // 用于转换的选项数组
      pointTypeOptions: [],
      pointAffiliationOptions: [],
      pointOptions: [{ label: '全部', value: '' }],

      smsReminderOptions: [
        { label: '是', value: true },
        { label: '否', value: false }
      ],
      filterParams: {
        areaCode: [],
        pointId: '',
        taskStatus: ''
      },
      taskStatusOptions: [
        { label: '全部', value: '' },
        { label: '待提醒', value: '0' },
        { label: '已提醒', value: '1' },
        { label: '已上报', value: '2' },
        { label: '已终止', value: '3' },
      ],

      // 表格配置
      rowKey: 'id',
      verticalAlign: 'top',
      hover: true,

      tableColumns: [
        { title: '提醒编号', align: 'left', width: 150, ellipsis: true, colKey: 'id' },
        { title: '行政区划', align: 'left', width: 150, ellipsis: true, colKey: 'adminRegion' },
        { title: '采价点', width: 180, ellipsis: true, colKey: 'pointName' },
        { title: '提醒时间', width: 180, ellipsis: true, colKey: 'remindTime' },
        { title: '采价员', width: 100, ellipsis: true, colKey: 'collector' },
        { title: '提醒状态', width: 100, ellipsis: true, colKey: 'status' },
        { title: '操作', align: 'left', fixed: 'right', width: 100, colKey: 'op' }
      ],

      tableData: [],

      pagination: {
        pageSize: 10,
        total: 0,
        pageNo: 1,
      },
      treeProps: {
        keys: {
          label: 'areaname',
          value: 'areacode',
          children: 'children',
        }
      },
    };
  },
  watch: {
    'filterParams.areaCode': function (newVal) {
      this.getPointOptions();
    },
  },
  mounted() {
    this.getAreaList();
    this.getPointTypeOptions();
    this.getPointAffiliationOptions();
    this.getPointOptions();
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.loading = true;

      const params = {
        condition: {
          primaryKey: this.id
        }
      };

      this.$request
        .post('/web/reportPlan/reportPlanDetails', params)
        .then((res) => {
          if (res.retCode === 200) {
            const data = res.retData;

            // 设置基础信息
            this.basicInfo = {
              planId: data.reportPlanId || '',
              adminRegion: this.getAreaNameFromCode(data.areacode) || data.areacode || '',
              pointType: this.getPointTypeNames(data.stallTypes || []),
              pointAffiliation: this.getPointAffiliationNames(data.stallVests || []),
              customerIdentifier: this.getCustomerIdentifierNames(data.customerIdentifications || []),
              category: data.varietyName || '',
              planPeriod: `${data.planBgnDate || ''}至${data.planEndDate || ''}`,
              reportPeriod: data.reportCycle ? data.reportCycle.toString() : '',
              sendSmsReminder: data.isSmsMessages === '1',
              selectedPoints: this.getPointNames(data.stallIds || []),
              creator: data.creatorName || '',
              createTime: data.createTime || '',
              endTime: data.endTime || '',
              canTerminate: data.taskStatus === '1' // 只有执行中的任务可以终止
            };

            // 设置行政区划选中状态
            this.selectedAreaCodes = data.areacodes || [];

            // 获取提醒列表
            this.handleSearch(true);
          } else {
            this.$message.error(res.retMsg || '获取计划详情失败');
          }
        })
        .catch((error) => {
          console.error('API调用出错:', error);
          this.$message.error('获取计划详情失败');
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 根据区域代码获取区域名称
    getAreaNameFromCode(areacode) {
      const findNodeName = (nodes, code) => {
        if (!nodes || !nodes.length) return null;

        for (const node of nodes) {
          if (node.areacode === code) {
            return node.areaname;
          }
          if (node.children && node.children.length) {
            const childName = findNodeName(node.children, code);
            if (childName) return childName;
          }
        }
        return null;
      };

      return findNodeName(this.areaList, areacode);
    },

    // 获取采价点类型名称
    getPointTypeNames(stallTypes) {
      if (!stallTypes || stallTypes.length === 0) return '';

      const names = stallTypes.map(code => {
        const option = this.pointTypeOptions.find(opt => opt.value === code);
        return option ? option.label : code;
      });

      return names.join('、');
    },

    // 获取采价点归属名称
    getPointAffiliationNames(stallVests) {
      if (!stallVests || stallVests.length === 0) return '';

      const names = stallVests.map(code => {
        const option = this.pointAffiliationOptions.find(opt => opt.value === code);
        return option ? option.label : code;
      });

      return names.join('、');
    },

    // 获取客户标识名称
    getCustomerIdentifierNames(customerIdentifications) {
      if (!customerIdentifications || customerIdentifications.length === 0) return '';

      const names = customerIdentifications.map(code => {
        return code === '1' ? '客户' : code === '0' ? '非客户' : code;
      });

      return names.join('、');
    },

    // 获取采价点名称
    getPointNames(stallIds) {
      if (!stallIds || stallIds.length === 0) return '';

      const names = stallIds.map(id => {
        const option = this.pointOptions.find(opt => opt.value === id);
        return option ? option.label : id;
      });

      return names.join('、');
    },

    getAreaList() {
      this.$request
        .post('/web/area/selectUserDataAreaTree')
        .then((res) => {
          if (res.retCode === 200) {
            this.areaList = res.retData || [];
          } else {
            this.$message.error(res.retMsg || '获取行政区划数据失败');
          }
        })
        .catch((e) => {
          console.error(e);
          this.$message.error('获取行政区划数据失败');
        });
    },

    getPointTypeOptions() {
      const params = {
        condition: {
          dictType: 'STALL_TYPE',
        },
      };

      this.$request
        .post('/web/dict/queryTypeDicts', params)
        .then((res) => {
          if (res.retCode === 200) {
            this.pointTypeOptions = [];

            if (res.retData && res.retData.length > 0) {
              const options = res.retData.map((item) => ({
                label: item.dictValue,
                value: item.dictCode,
              }));

              this.pointTypeOptions = [...this.pointTypeOptions, ...options];
            }
          } else {
            this.$message.error(res.retMsg || '获取采价点类型失败');
          }
        })
        .catch((e) => {
          console.error(e);
          this.$message.error('获取采价点类型失败');
        });
    },

    getPointAffiliationOptions() {
      const params = {
        condition: {
          dictType: 'VEST_TYPE',
        },
      };

      this.$request
        .post('/web/dict/queryTypeDicts', params)
        .then((res) => {
          if (res.retCode === 200) {
            this.pointAffiliationOptions = [];

            if (res.retData && res.retData.length > 0) {
              const options = res.retData.map((item) => ({
                label: item.dictValue,
                value: item.dictCode,
              }));

              this.pointAffiliationOptions = [...this.pointAffiliationOptions, ...options];
            }
          } else {
            this.$message.error(res.retMsg || '获取采价点归属失败');
          }
        })
        .catch((e) => {
          console.error(e);
          this.$message.error('获取采价点归属失败');
        });
    },

    getPointOptions() {
      const params = {
        condition: {
          stallTypes: [],
          stallVests: [],
          areacodes: this.filterParams.areaCode || [],
        },
      };

      this.$request
        .post('/web/stall/selectChooseStalls', params)
        .then((res) => {
          if (res.retCode === 200) {
            this.pointOptions = [{ label: '全部', value: '' }];

            if (res.retData && res.retData.length > 0) {
              const options = res.retData.map((item) => ({
                label: item.stallName,
                value: item.stallId,
              }));

              this.pointOptions = [...this.pointOptions, ...options];
            }

            if (this.filterParams.pointId && !this.pointOptions.some((option) => option.value === this.filterParams.pointId)) {
              this.filterParams.pointId = '';
            }
          } else {
            this.$message.error(res.retMsg || '获取采价点数据失败');
          }
        })
        .catch((e) => {
          console.error(e);
          this.$message.error('获取采价点数据失败');
        });
    },

    handleViewRegion() {
      this.regionDialogVisible = true;
    },

    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
    },

    formatDateRange(startDate, endDate) {
      if (!startDate && !endDate) return '';
      if (!startDate) return endDate;
      if (!endDate) return startDate;
      if (startDate === endDate) return startDate;
      return `${startDate} 至 ${endDate}`;
    },

    handleSearch(isSearch = false) {
      if (isSearch) {
        this.pagination.pageNo = 1;
      }

      this.tableLoading = true;

      const params = {
        condition: {
          areaCodes: this.filterParams.areaCode || [],
          taskStatus: this.filterParams.taskStatus,
        },
        pageNo: this.pagination.pageNo,
        pageSize: this.pagination.pageSize,
      };

      this.$request
        .post('/web/reportPlan/reportPlanDetailsRemindList', params)
        .then((res) => {
          if (res.retCode === 200) {
            const records = res.retData.records || [];

            this.tableData = records.map((item) => {
              return {
                id: item.remindId || '',
                adminRegion: item.areaname || '',
                pointName: item.stallName || '',
                remindTime: this.formatDateRange(item.remindBgnDate, item.remindEndDate),
                collector: item.collectorName || '',
                status: item.remindStatus || '',
              };
            });

            this.pagination.total = res.retData.total || 0;
          } else {
            this.$message.error(res.retMsg || '获取提醒列表失败');
          }
        })
        .catch((e) => {
          console.error(e);
          this.$message.error('获取提醒列表失败');
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },

    handleReset() {
      this.filterParams = {
        areaCode: [],
        pointId: '',
        taskStatus: ''
      };
      this.handleSearch(true);
    },

    onCurrentChange(current) {
      this.pagination.pageNo = current;
      this.handleSearch();
    },

    onPageSizeChange(size) {
      this.pagination.pageSize = size;
      this.handleSearch();
    },

    handleViewTaskDetail(row) {
      this.$router.push({
        name: 'marketPriceReportingDetail',
        params: { id: row.id }
      });
    },

    handleTerminate() {
      const confirmDialog = this.$dialog.confirm({
        header: '终止计划',
        body: '确定要终止该计划吗？终止后无法恢复。',
        confirmBtn: {
          content: '确定',
          theme: 'danger',
        },
        cancelBtn: {
          content: '取消',
          theme: 'default',
        },
        onConfirm: () => {
          const params = {
            condition: {
              primaryKey: this.id
            }
          };

          this.$request
            .post('/web/reportPlan/programTerminationStop', params)
            .then(res => {
              if (res.retCode === 200) {
                this.$message.success('计划已成功终止');
                confirmDialog.hide();

                // 更新基础信息状态
                this.basicInfo.canTerminate = false;
                this.basicInfo.endTime = new Date().toLocaleString();

                // 刷新提醒列表
                this.handleSearch();
              } else {
                this.$message.error(res.retMsg || '终止计划失败');
              }
            })
            .catch(err => {
              console.error(err);
              this.$message.error('终止计划失败');
            });
        },
      });
    },

    goBack() {
      this.$router.back();
    }
  }
});
</script>

<style lang="less" scoped>
.detail-container {
  padding-bottom: 20px;
}

.section {
  // margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;

  .section-title-marker {
    width: 4px;
    height: 16px;
    background-color: var(--td-brand-color);
    margin-right: 8px;
  }
}

.section-content {
  transition: max-height 0.3s ease;
  overflow: hidden;
  max-height: 1000px;

  &.collapsed {
    max-height: 160px; // 约两行的高度
  }
}

.field-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;

  label {
    font-size: 14px;
    color: var(--td-text-color-secondary);
    margin-bottom: 8px;
  }
}

.plan-terminate-btn {
  margin-top: 28px; // 对齐输入框
}

.filter-actions {
  display: flex;
  align-items: flex-end;
  height: 100%;
  padding-bottom: 4px;
}

.table-container {
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.actions-container {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

.t-button-link {
  margin-right: 8px;
}

.region-tree-container {
  padding: 10px 0;

  :deep(.t-tree) {
    max-height: 400px;
    overflow-y: auto;

    // 美化滚动条
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #c0c0c0;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #a0a0a0;
    }
  }
}
</style>