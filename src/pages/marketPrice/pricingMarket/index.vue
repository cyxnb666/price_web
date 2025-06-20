<template>
  <div>
    <t-card class="list-card-container" :bordered="false">
      <t-form ref="form" :data="formData" :label-width="80" colon @reset="onReset" @submit="onSearch">
        <t-row :gutter="[16, 24]" :style="{ marginBottom: '10px' }">
          <t-col :span="3">
            <t-form-item label="行政区划" name="areaCode">
              <t-tree-select clearable v-model="formData.areaCode" :treeProps="treeProps" :data="areaList"
                placeholder="默认全部支持，模糊输入带出" />
            </t-form-item>
          </t-col>
          <t-col :span="3">
            <t-form-item label="品种" name="varietyType">
              <t-select clearable v-model="formData.varietyType" class="form-item-content" :options="varietyOptions"
                placeholder="默认全部支持，模糊输入带出" />
            </t-form-item>
          </t-col>
          <t-col :span="3">
            <t-form-item label="品类" name="categoryType">
              <t-select clearable v-model="formData.categoryType" class="form-item-content" :options="categoryOptions"
                placeholder="默认全部支持，模糊输入带出" />
            </t-form-item>
          </t-col>
          <t-col :span="3">
            <t-form-item label="计价方式" name="pricingMethod">
              <t-select clearable v-model="formData.pricingMethod" class="form-item-content"
                :options="pricingMethodOptions" placeholder="全部" />
            </t-form-item>
          </t-col>
        </t-row>

        <t-row :gutter="[16, 24]">
          <t-col :span="3">
            <t-form-item label="规格" name="specification">
              <t-select clearable v-model="formData.specification" class="form-item-content"
                :options="specificationOptions" placeholder="默认全部，模糊品显+计价方式带出" />
            </t-form-item>
          </t-col>
          <t-col :span="3">
            <t-form-item label="采价员" name="collector">
              <t-input clearable v-model="formData.collector" class="form-item-content" placeholder="默认全部支持，模糊输入带出" />
            </t-form-item>
          </t-col>
          <t-col :span="4">
            <t-form-item label="价格日期" name="priceDate">
              <t-date-range-picker v-model="formData.priceDate" placeholder="请选择日期区间" />
            </t-form-item>
          </t-col>
        </t-row>

        <t-row :gutter="20" style="margin-top: 16px">
          <t-col :span="24">
            <div class="operation-container" style="display: flex; justify-content: space-between">
              <div></div>
              <div>
                <t-button theme="primary" type="submit">查询</t-button>
                <t-button type="reset" variant="base" theme="default" :style="{ marginLeft: '8px' }">重置</t-button>
              </div>
            </div>
          </t-col>
        </t-row>
      </t-form>
      <div class="table-container">
        <t-table :columns="columns" :data="data" :rowKey="rowKey" :verticalAlign="verticalAlign" :hover="hover"
          :pagination="pagination" :loading="dataLoading" :headerAffixedTop="true" height="calc(100vh - 420px)">
          <template #operation="slotProps">
            <t-button theme="primary" variant="text" class="t-button-link"
              style="color: #0052d9; padding: 0px 0px 10px 0px" @click="handleViewDetails(slotProps)">详情</t-button>
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
  name: 'PricingMarket',
  data() {
    return {
      prefix,
      dataLoading: false,
      loading: false,
      data: [],
      columns: [
        {
          title: '行政区划',
          align: 'left',
          width: 150,
          ellipsis: true,
          colKey: 'areaname',
        },
        {
          title: '日期',
          align: 'left',
          width: 120,
          ellipsis: true,
          colKey: 'collectDate',
        },
        {
          title: '品类',
          width: 120,
          ellipsis: true,
          colKey: 'categoryName',
        },
        {
          title: '品种',
          width: 120,
          ellipsis: true,
          colKey: 'varietyName',
        },
        {
          title: '计价方式',
          width: 120,
          ellipsis: true,
          colKey: 'specsTypeName',
        },
        {
          title: '规格',
          width: 120,
          ellipsis: true,
          colKey: 'ruleName',
        },
        {
          title: '行情价',
          width: 120,
          ellipsis: true,
          colKey: 'unitPrice',
        },
        {
          title: '采价员',
          width: 120,
          ellipsis: true,
          colKey: 'collectorName',
        },
        {
          title: '上报时间',
          width: 150,
          ellipsis: true,
          colKey: 'collectTime',
        },
        {
          title: '操作',
          width: 100,
          colKey: 'operation',
        }
      ],
      formData: {
        areaCode: '',
        categoryType: '',
        varietyType: '',
        pricingMethod: '',
        specification: '',
        collector: '',
        priceDate: [],
      },
      categoryOptions: [
        { label: '全部', value: '' },
      ],
      varietyOptions: [
        { label: '全部', value: '' },
      ],
      pricingMethodOptions: [
        { label: '全部', value: '' },
        { label: '按重量', value: 'WEIGHT' },
        { label: '按果径', value: 'DIAMETER' },
        { label: '按统果', value: 'WHOLE' },
      ],
      specificationOptions: [
        { label: '全部', value: '' },
      ],
      rowKey: 'id',
      verticalAlign: 'top',
      hover: true,
      areaList: [],
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
    'formData.varietyType': function (newVal) {
      this.getCategoryOptions(newVal);
      // 品种变化时清空品类选择
      this.formData.categoryType = '';
      // 品种变化时重新获取规格
      this.getSpecificationOptions();
    },
    // 监听计价方式变化
    'formData.pricingMethod': function () {
      this.getSpecificationOptions();
    },
  },
  mounted() {
    this.getAreaList();
    this.getVarietyOptions();

    const hasState = this.loadStateFromStorage();
    if (hasState) {
      // 如果有保存的状态，需要根据保存的品种获取品类和规格
      if (this.formData.varietyType) {
        this.getCategoryOptions(this.formData.varietyType);
      }
      this.getSpecificationOptions();
      this.getList();
    } else {
      this.getSpecificationOptions();
      this.getList();
      this.saveStateToStorage();
    }
  },
  methods: {
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
    // 获取品类数据
    getCategoryOptions(varietyId) {
      if (!varietyId) {
        this.categoryOptions = [{ label: '全部', value: '' }];
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
            this.categoryOptions = [{ label: '全部', value: '' }];

            if (res.retData && res.retData.length > 0) {
              const options = res.retData.map((item) => ({
                label: item.categoryName,
                value: item.categoryId,
              }));

              this.categoryOptions = [...this.categoryOptions, ...options];
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
    // 获取规格数据
    getSpecificationOptions() {
      const params = {
        condition: {
          specsType: this.formData.pricingMethod || "",
          varietyId: this.formData.varietyType ? Number(this.formData.varietyType) : 0
        }
      };

      this.$request
        .post('/web/market/selectChooseSpecs', params)
        .then((res) => {
          if (res.retCode === 200) {
            this.specificationOptions = [{ label: '全部', value: '' }];

            if (res.retData && res.retData.length > 0) {
              const options = res.retData.map((item) => ({
                label: item.ruleName,
                value: item.specsId,
              }));

              this.specificationOptions = [...this.specificationOptions, ...options];
            }
          } else {
            this.$message.error(res.retMsg || '获取规格失败');
          }
        })
        .catch((e) => {
          console.error(e);
          this.$message.error('获取规格失败');
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
      sessionStorage.setItem('pricingMarketState', JSON.stringify(stateToSave));
    },

    // 从本地存储加载状态
    loadStateFromStorage() {
      const savedState = sessionStorage.getItem('pricingMarketState');
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
      this.categoryOptions = [{ label: '全部', value: '' }];
      this.specificationOptions = [{ label: '全部', value: '' }];
      this.getList(true);
      this.saveStateToStorage();
    },
    getList(isSearch = false) {
      if (isSearch) {
        this.pagination.pageNo = 1;
      }

      this.dataLoading = true;

      // 处理日期区间
      let startDate = '';
      let endDate = '';
      if (this.formData.priceDate && this.formData.priceDate.length === 2) {
        startDate = this.formData.priceDate[0];
        endDate = this.formData.priceDate[1];
      }

      const params = {
        condition: {
          areacode: this.formData.areaCode || "",
          categoryId: this.formData.categoryType ? Number(this.formData.categoryType) : 0,
          collector: this.formData.collector || "",
          endDate: endDate,
          specsId: this.formData.specification || "",
          specsType: this.formData.pricingMethod || "",
          startDate: startDate,
          varietyId: this.formData.varietyType ? Number(this.formData.varietyType) : 0
        },
        pageNo: this.pagination.pageNo,
        pageSize: this.pagination.pageSize,
      };

      this.$request
        .post('/web/market/pageQueryFruitMarkets', params)
        .then((res) => {
          if (res.retCode === 200) {
            console.log('采价行情数据:', res.retData);
            this.data = res.retData.records || [];
            this.pagination.total = res.retData.total || 0;
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
        name: 'pricingMarketDetail',
        params: {
          id: row.fruitMarketId,
        },
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
  margin-top: 20px;
}

.t-button-link {
  margin-right: 8px;
}
</style>