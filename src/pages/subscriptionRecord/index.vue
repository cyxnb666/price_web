<template>
  <div>
    <t-card class="list-card-container" :bordered="false">
      <t-form ref="form" :data="formData" :label-width="80" colon @reset="onReset" @submit="onSearch">
        <t-row :gutter="[16, 24]" :style="{ marginBottom: '10px' }">
          <t-col :span="3">
            <t-form-item label="行政区划" name="areaCode">
              <t-tree-select clearable v-model="formData.areaCode" :treeProps="treeProps" :data="areaList"
                placeholder="请选择行政区划" />
            </t-form-item>
          </t-col>
          <t-col :span="3">
            <t-form-item label="品种" name="varietyId">
              <t-select clearable v-model="formData.varietyId" class="form-item-content" :options="varietyOptions"
                placeholder="请选择品种" />
            </t-form-item>
          </t-col>
          <t-col :span="3">
            <t-form-item label="品类" name="categoryType">
              <t-select clearable v-model="formData.categoryType" class="form-item-content"
                :options="categoryTypeOptions" placeholder="请选择品类" />
            </t-form-item>
          </t-col>
          <t-col :span="3">
            <t-form-item label="订购来源" name="subscriptionSource">
              <t-select clearable v-model="formData.subscriptionSource" class="form-item-content"
                :options="subscriptionSourceOptions" placeholder="请选择订购来源" />
            </t-form-item>
          </t-col>
        </t-row>

        <t-row :gutter="[16, 24]">
          <t-col :span="3">
            <t-form-item label="来源名称" name="sourceName">
              <t-select clearable v-model="formData.sourceName" class="form-item-content" :options="sourceNameOptions"
                placeholder="请选择来源名称" />
            </t-form-item>
          </t-col>
          <t-col :span="3">
            <t-form-item label="订购月份" name="subscriptionMonth">
              <t-date-range-picker v-model="formData.subscriptionMonth" mode="month" format="YYYY-MM" clearable
                placeholder="请选择月份区间" />
            </t-form-item>
          </t-col>
        </t-row>

        <!-- 按钮区域 -->
        <t-row :gutter="20" style="margin-top: 16px">
          <t-col :span="24">
            <div class="operation-container" style="display: flex; justify-content: flex-end">
              <t-button theme="primary" type="submit">查询</t-button>
              <t-button type="reset" variant="base" theme="default" :style="{ marginLeft: '8px' }">重置</t-button>
              <t-button theme="default" @click="handleExport" :style="{ marginLeft: '8px' }"
                :loading="exportLoading">导出</t-button>
            </div>
          </t-col>
        </t-row>
      </t-form>

      <div class="table-container">
        <t-table :columns="columns" :data="data" :rowKey="rowKey" :verticalAlign="verticalAlign" :hover="hover"
          :pagination="pagination" :loading="dataLoading" :headerAffixedTop="true" height="calc(100vh - 420px)">
          <template #op="slotProps">
            <a class="t-button-link" style="color: #0052d9" @click="handleViewDetails(slotProps)">详情</a>
          </template>
        </t-table>
      </div>

      <div class="pagination">
        <t-pagination showFirstAndLastPageBtn :total="pagination.total" :default-current="pagination.pageNo"
          :default-page-size="pagination.pageSize" @current-change="onCurrentChange"
          @page-size-change="onPageSizeChange" />
      </div>
    </t-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { prefix } from '@/config/global';

export default Vue.extend({
  name: 'SubscriptionRecord',
  data() {
    return {
      prefix,
      dataLoading: false,
      exportLoading: false,
      loading: false,
      data: [],
      columns: [
        {
          title: '上报序号',
          align: 'left',
          width: 150,
          ellipsis: true,
          colKey: 'recordId',
          fixed: 'left',
        },
        {
          title: '上报价格归属',
          align: 'left',
          width: 120,
          ellipsis: true,
          colKey: 'areaname',
        },
        {
          title: '订购来源',
          width: 100,
          ellipsis: true,
          colKey: 'orderSourceName',
        },
        {
          title: '来源名称',
          width: 120,
          ellipsis: true,
          colKey: 'stallName',
        },
        {
          title: '品类',
          width: 80,
          ellipsis: true,
          colKey: 'categoryName',
        },
        {
          title: '品种',
          width: 80,
          ellipsis: true,
          colKey: 'varietyName',
        },
        {
          title: '订购月份',
          width: 100,
          ellipsis: true,
          colKey: 'collectMonth',
        },
        {
          title: '上报时间',
          width: 160,
          ellipsis: true,
          colKey: 'collectTime',
        },
        {
          title: '上报人',
          width: 100,
          ellipsis: true,
          colKey: 'registUserName',
        },
        {
          align: 'left',
          fixed: 'right',
          width: 120,
          colKey: 'op',
          title: '操作',
        },
      ],
      formData: {
        areaCode: '',
        categoryType: '',
        varietyId: '',
        subscriptionSource: '',
        sourceName: '',
        subscriptionMonth: [],
      },
      rowKey: 'id',
      verticalAlign: 'top',
      hover: true,
      areaList: [],
      categoryTypeOptions: [
        { label: '全部', value: '' },
      ],
      varietyOptions: [
        { label: '全部', value: '' },
      ],
      subscriptionSourceOptions: [
        { label: '全部', value: '' }
      ],
      sourceNameOptions: [
        { label: '全部', value: '' }
      ],
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
        },
      },
    };
  },
  watch: {
    // 监听品种变化
    'formData.varietyId': function (newVal) {
      this.getCategoryOptions(newVal);
      // 品种变化时清空品类选择
      this.formData.categoryType = '';
    },
  },
  mounted() {
    const hasState = this.loadStateFromStorage();
    if (hasState) {
      this.getList();
    } else {
      this.getList();
      this.saveStateToStorage();
    }
    this.getAreaList();
    this.getVarietyOptions();
    this.getSubscriptionSourceOptions();
    this.getSourceNameOptions();
  },
  methods: {
    // 获取品类数据
    getCategoryOptions(varietyId) {
      if (!varietyId) {
        this.categoryTypeOptions = [{ label: '全部', value: '' }];
        return;
      }

      const params = {
        condition: {
          primaryKey: varietyId
        }
      };

      this.$request
        .post('/web/category/selectVarietyCategories', params)
        .then((res) => {
          if (res.retCode === 200) {
            this.categoryTypeOptions = [{ label: '全部', value: '' }];

            if (res.retData && res.retData.length > 0) {
              const options = res.retData.map((item) => ({
                label: item.categoryName,
                value: item.categoryId,
              }));

              this.categoryTypeOptions = [...this.categoryTypeOptions, ...options];
            }
          } else {
            this.$message.error(res.retMsg || '获取品类失败');
          }
        })
        .catch((e) => {
          console.error(e);
          this.$message.error('获取品类失败');
        });
    },
    // 获取品种数据
    getVarietyOptions() {
      this.$request
        .post('/web/variety/selectButtomVarieties')
        .then((res) => {
          if (res.retCode === 200) {
            this.varietyOptions = [{ label: '全部', value: '' }];

            if (res.retData && res.retData.length > 0) {
              const options = res.retData.map((item) => ({
                label: item.varietyName,
                value: item.varietyId,
              }));

              this.varietyOptions = [...this.varietyOptions, ...options];
            }
          } else {
            this.$message.error(res.retMsg || '获取品种失败');
          }
        })
        .catch((e) => {
          console.error(e);
          this.$message.error('获取品种失败');
        });
    },
    // 获取行政区划数据
    getAreaList() {
      this.$request
        .post('/web/area/selectUserDataAreaTree')
        .then((res) => {
          if (res.retCode === 200) {
            this.areaList = res.retData || [];
          }
        })
        .catch((e: Error) => {
          console.log(e);
        });
    },
    // 获取订购来源选项
    getSubscriptionSourceOptions() {
      const params = {
        condition: {
          dictType: "STALL_TYPE"
        }
      };

      this.$request
        .post('/web/dict/queryTypeDicts', params)
        .then((res) => {
          if (res.retCode === 200) {
            this.subscriptionSourceOptions = [{ label: '全部', value: '' }];

            if (res.retData && res.retData.length > 0) {
              const options = res.retData.map((item) => ({
                label: item.dictValue,
                value: item.dictCode,
              }));

              this.subscriptionSourceOptions = [...this.subscriptionSourceOptions, ...options];
            }
          } else {
            this.$message.error(res.retMsg || '获取订购来源失败');
          }
        })
        .catch((e) => {
          console.error(e);
          this.$message.error('获取订购来源失败');
        });
    },
    // 获取来源名称选项
    getSourceNameOptions() {
      const params = {
        condition: {
          stallType: "",
          stallVests: [],
          areacodes: []
        }
      };

      this.$request
        .post('/web/stall/selectChooseStalls', params)
        .then((res) => {
          if (res.retCode === 200) {
            this.sourceNameOptions = [{ label: '全部', value: '' }];

            if (res.retData && res.retData.length > 0) {
              const options = res.retData.map((item) => ({
                label: item.stallName,
                value: item.stallId,
              }));

              this.sourceNameOptions = [...this.sourceNameOptions, ...options];
            }
          } else {
            this.$message.error(res.retMsg || '获取来源名称失败');
          }
        })
        .catch((e) => {
          console.error(e);
          this.$message.error('获取来源名称失败');
        });
    },
    // 保存状态到本地存储
    saveStateToStorage() {
      const stateToSave = {
        formData: this.formData,
        pagination: {
          pageSize: this.pagination.pageSize,
          pageNo: this.pagination.pageNo
        }
      };
      sessionStorage.setItem('subscriptionRecordState', JSON.stringify(stateToSave));
    },
    // 从本地存储加载状态
    loadStateFromStorage() {
      const savedState = sessionStorage.getItem('subscriptionRecordState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        this.formData = { ...parsedState.formData };
        this.pagination.pageNo = parsedState.pagination.pageNo;
        this.pagination.pageSize = parsedState.pagination.pageSize;
        return true;
      }
      return false;
    },
    onSearch() {
      this.getList(true);
      this.saveStateToStorage();
    },
    onReset() {
      this.$set(this.$data, 'formData', this.$options.data().formData);
      this.categoryTypeOptions = [{ label: '全部', value: '' }];
      this.getList(true);
      this.saveStateToStorage();
    },
    getList(isSearch = false) {
      if (isSearch) {
        this.pagination.pageNo = 1;
      }

      this.dataLoading = true;

      let collectMonthStart = '';
      let collectMonthEnd = '';
      if (this.formData.subscriptionMonth && this.formData.subscriptionMonth.length === 2) {
        collectMonthStart = this.formData.subscriptionMonth[0];
        collectMonthEnd = this.formData.subscriptionMonth[1];
      }

      const params = {
        condition: {
          areacode: this.formData.areaCode || "",
          categoryId: this.formData.categoryType ? Number(this.formData.categoryType) : 0,
          collectMonthStart: collectMonthStart,
          collectMonthEnd: collectMonthEnd,
          orderSource: this.formData.subscriptionSource || "",
          stallId: this.formData.sourceName || "",
          varietyId: this.formData.varietyId ? Number(this.formData.varietyId) : 0,
        },
        pageNo: this.pagination.pageNo,
        pageSize: this.pagination.pageSize,
      };

      this.$request
        .post('/web/orecord/pageQueryOrderRecords', params)
        .then((res) => {
          if (res.retCode === 200) {
            // 先打印返回数据看结构
            console.log('API返回数据:', res.retData);

            this.data = res.retData.records || [];
            this.pagination.total = res.retData.total || 0;
            this.saveStateToStorage();
          } else {
            this.$message.error(res.retMsg || '获取数据失败');
          }
        })
        .catch((e) => {
          console.error(e);
          this.$message.error('获取数据失败');
        })
        .finally(() => {
          this.dataLoading = false;
        });
    },
    onPageSizeChange(size) {
      this.pagination.pageSize = size;
      this.getList();
      this.saveStateToStorage();
    },
    onCurrentChange(current) {
      this.pagination.pageNo = current;
      this.getList();
      this.saveStateToStorage();
    },
    handleViewDetails({ row }) {
      this.$router.push({
        name: 'subscriptionRecordDetail',
        params: {
          id: String(row.recordId),
        },
      });
    },
    handleExport() {
      this.exportLoading = true;

      let collectMonthStart = '';
      let collectMonthEnd = '';
      if (this.formData.subscriptionMonth && this.formData.subscriptionMonth.length === 2) {
        collectMonthStart = this.formData.subscriptionMonth[0];
        collectMonthEnd = this.formData.subscriptionMonth[1];
      }

      const params = {
        condition: {
          areacode: this.formData.areaCode || "",
          categoryId: this.formData.categoryType ? Number(this.formData.categoryType) : 0,
          collectMonthStart: collectMonthStart,
          collectMonthEnd: collectMonthEnd,
          orderSource: this.formData.subscriptionSource || "",
          stallId: this.formData.sourceName || "",
          varietyId: this.formData.varietyId ? Number(this.formData.varietyId) : 0,
        },
      };

      this.$request
        .post('/web/orecord/export', params, {
          responseType: 'arraybuffer',
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            Accept: 'application/vnd.ms-excel',
          },
        })
        .then((response) => {
          // 处理文件名
          let filename = '订购记录.xlsx';

          // 从headers中获取文件名
          const disposition = response.headers['content-disposition'];
          if (disposition && disposition.indexOf('attachment') !== -1) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) {
              filename = decodeURIComponent(matches[1].replace(/['"]/g, ''));
            }
          }
          const blob = new Blob([response.data], {
            type: 'application/vnd.ms-excel;charset=utf8',
          });
          const link = document.createElement('a');
          const url = window.URL.createObjectURL(blob);
          link.href = url;
          link.setAttribute('download', filename);
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();

          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          }, 100);

          this.$message.success('导出成功');
        })
        .catch((error) => {
          console.error('导出失败:', error);
          this.$message.error('导出失败，请稍后重试');
        })
        .finally(() => {
          this.exportLoading = false;
        });
    },
  },
});
</script>

<style lang="less" scoped>
.list-card-container {
  // padding: 20px;
}

.operation-container {
  display: flex;
  align-items: flex-end;
  margin-bottom: 16px;
}

.table-container {
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
}

.t-button-link {
  margin-right: 8px;
}
</style>