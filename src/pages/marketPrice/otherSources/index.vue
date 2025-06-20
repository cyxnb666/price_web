<template>
  <div>
    <t-card class="list-card-container" :bordered="false">
      <t-tabs v-model="activeTab" @change="handleTabChange">
        <t-tab-panel value="marketPrice" label="行情价"></t-tab-panel>
        <t-tab-panel value="supplyPrice" label="货源价"></t-tab-panel>
      </t-tabs>

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
            <t-form-item label="渠道来源" name="channelSource">
              <t-select clearable v-model="formData.channelSource" class="form-item-content"
                :options="channelSourceOptions" placeholder="默认全部支持，模糊输入带出" />
            </t-form-item>
          </t-col>
        </t-row>

        <t-row :gutter="[16, 24]">
          <t-col :span="4">
            <t-form-item label="价格日期" name="priceDate">
              <t-date-range-picker v-model="formData.priceDate" placeholder="请选择日期区间" />
            </t-form-item>
          </t-col>
        </t-row>

        <t-row :gutter="20" style="margin-top: 16px">
          <t-col :span="24">
            <div class="operation-container" style="display: flex; justify-content: flex-end">
              <t-button theme="default" type="reset" :style="{ marginRight: '8px' }">重置</t-button>
              <t-button theme="primary" type="submit">查询</t-button>
            </div>
          </t-col>
        </t-row>
      </t-form>

      <div class="table-container">
        <t-table v-if="activeTab === 'marketPrice'" :columns="columns" :data="marketPriceData" :rowKey="rowKey"
          :verticalAlign="verticalAlign" :hover="hover" :pagination="marketPricePagination"
          :loading="marketPriceLoading" :headerAffixedTop="true" height="calc(100vh - 450px)">
        </t-table>

        <t-table v-else :columns="columns" :data="supplyPriceData" :rowKey="rowKey" :verticalAlign="verticalAlign"
          :hover="hover" :pagination="supplyPricePagination" :loading="supplyPriceLoading" :headerAffixedTop="true"
          height="calc(100vh - 450px)">
        </t-table>
      </div>

      <div class="pagination">
        <t-pagination v-if="activeTab === 'marketPrice'" showFirstAndLastPageBtn :total="marketPricePagination.total"
          :current="marketPricePagination.pageNo" :pageSize="marketPricePagination.pageSize"
          @current-change="onMarketPriceCurrentChange" @page-size-change="onMarketPricePageSizeChange" />

        <t-pagination v-else showFirstAndLastPageBtn :total="supplyPricePagination.total"
          :current="supplyPricePagination.pageNo" :pageSize="supplyPricePagination.pageSize"
          @current-change="onSupplyPriceCurrentChange" @page-size-change="onSupplyPricePageSizeChange" />
      </div>
    </t-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { prefix } from '@/config/global';

export default Vue.extend({
  name: 'OtherSources',
  data() {
    return {
      prefix,
      activeTab: 'marketPrice',

      // 行情价相关状态
      marketPriceLoading: false,
      marketPriceData: [],
      marketPricePagination: {
        pageSize: 10,
        total: 0,
        pageNo: 1,
      },

      // 货源价相关状态
      supplyPriceLoading: false,
      supplyPriceData: [],
      supplyPricePagination: {
        pageSize: 10,
        total: 0,
        pageNo: 1,
      },

      // 共用的表格配置
      columns: [
        {
          title: '行政区划',
          align: 'left',
          width: 150,
          ellipsis: true,
          colKey: 'area',
        },
        {
          title: '日期',
          align: 'left',
          width: 120,
          ellipsis: true,
          colKey: 'date',
        },
        {
          title: '品类',
          width: 120,
          ellipsis: true,
          colKey: 'category',
        },
        {
          title: '品种',
          width: 120,
          ellipsis: true,
          colKey: 'variety',
        },
        {
          title: '价格',
          width: 120,
          ellipsis: true,
          colKey: 'price',
        },
        {
          title: '价格渠道来源',
          width: 150,
          ellipsis: true,
          colKey: 'channelSource',
        }
      ],

      // 表单数据
      formData: {
        areaCode: '',
        categoryType: '',
        varietyType: '',
        channelSource: '',
        priceDate: [], // 日期区间，使用数组
      },

      // 下拉选项数据
      categoryOptions: [
        { label: '全部', value: '' },
        { label: '柑橘', value: '1' },
        { label: '猕猴桃', value: '2' },
        { label: '桃', value: '3' },
      ],
      varietyOptions: [
        { label: '全部', value: '' },
        { label: '不知火', value: '1' },
        { label: '绿果', value: '2' },
        { label: '东阳', value: '3' },
      ],
      channelSourceOptions: [
        { label: '全部', value: '' },
        { label: '惠农网', value: '1' },
        { label: '食品商务网', value: '2' },
      ],

      // 其他共用配置
      rowKey: 'id',
      verticalAlign: 'top',
      hover: true,
      areaList: [
        {
          areaname: '四川',
          areacode: 'SC',
          children: [
            {
              areaname: '成都',
              areacode: 'CD',
              children: [
                {
                  areaname: '双区',
                  areacode: 'SQ',
                },
                {
                  areaname: '金堂',
                  areacode: 'JT',
                },
              ],
            },
          ],
        },
        {
          areaname: '重庆',
          areacode: 'CQ',
          children: [],
        },
      ],
      treeProps: {
        keys: {
          label: 'areaname',
          value: 'areacode',
          children: 'children',
        },
      },
    };
  },
  mounted() {
    // 初始加载行情价数据
    this.getMarketPriceData();
  },
  methods: {
    // Tab切换处理
    handleTabChange(value) {
      if (value === 'marketPrice') {
        // 行情价标签被选中，加载行情价数据
        if (this.marketPriceData.length === 0) {
          this.getMarketPriceData();
        }
      } else {
        // 货源价标签被选中，加载货源价数据
        if (this.supplyPriceData.length === 0) {
          this.getSupplyPriceData();
        }
      }
    },

    // 查询按钮点击处理
    onSearch() {
      if (this.activeTab === 'marketPrice') {
        this.getMarketPriceData(true);
      } else {
        this.getSupplyPriceData(true);
      }
    },

    // 重置按钮点击处理
    onReset() {
      this.$set(this.$data, 'formData', this.$options.data().formData);

      if (this.activeTab === 'marketPrice') {
        this.getMarketPriceData(true);
      } else {
        this.getSupplyPriceData(true);
      }
    },

    // 获取行情价数据
    getMarketPriceData(isSearch = false) {
      if (isSearch) {
        this.marketPricePagination.pageNo = 1;
      }

      this.marketPriceLoading = true;

      // 示例代码，实际应该是行情价的API调用
      // this.$request.post('/api/marketPrice/list', {
      //   pageNo: this.marketPricePagination.pageNo,
      //   pageSize: this.marketPricePagination.pageSize,
      //   ...this.formData  // 添加查询条件
      // }).then(res => {
      //   if (res.code === 200) {
      //     this.marketPriceData = res.data.list;
      //     this.marketPricePagination.total = res.data.total;
      //   }
      //   this.marketPriceLoading = false;
      // }).catch(() => {
      //   this.marketPriceLoading = false;
      // });

      // 模拟API请求
      setTimeout(() => {
        this.marketPriceData = [
          {
            id: '1',
            area: '四川-成都-双区',
            date: '2025-02-10',
            category: '柑橘',
            variety: '把把柑',
            price: '1.55元/斤',
            channelSource: '惠农网',
          },
          {
            id: '2',
            area: '四川-成都-金堂',
            date: '2025-02-12',
            category: '桃',
            variety: '皮球桃',
            price: '5.26元/公斤',
            channelSource: '食品商务网',
          },
          {
            id: '3',
            area: '四川-成都-金堂',
            date: '2025-02-15',
            category: '猕猴桃',
            variety: '东阳',
            price: '5.26元/公斤',
            channelSource: '食品商务网',
          },
        ];
        this.marketPricePagination.total = 3;
        this.marketPriceLoading = false;
      }, 300);
    },

    // 获取货源价数据
    getSupplyPriceData(isSearch = false) {
      if (isSearch) {
        this.supplyPricePagination.pageNo = 1;
      }

      this.supplyPriceLoading = true;

      // 示例代码，实际应该是货源价的API调用
      // this.$request.post('/api/supplyPrice/list', {
      //   pageNo: this.supplyPricePagination.pageNo,
      //   pageSize: this.supplyPricePagination.pageSize,
      //   ...this.formData  // 添加查询条件
      // }).then(res => {
      //   if (res.code === 200) {
      //     this.supplyPriceData = res.data.list;
      //     this.supplyPricePagination.total = res.data.total;
      //   }
      //   this.supplyPriceLoading = false;
      // }).catch(() => {
      //   this.supplyPriceLoading = false;
      // });

      // 模拟API请求
      setTimeout(() => {
        this.supplyPriceData = [
          {
            id: '1',
            area: '四川-绵阳-xx',
            date: '2025-02-10',
            category: '柑橘',
            variety: '把把柑',
            price: '1.45元/斤',
            channelSource: '惠农网',
          },
          {
            id: '2',
            area: '四川-成都-金堂',
            date: '2025-02-13',
            category: '桃',
            variety: '皮球桃',
            price: '5.10元/公斤',
            channelSource: '食品商务网',
          },
          {
            id: '3',
            area: '四川-攀枝花-xx',
            date: '2025-02-14',
            category: '猕猴桃',
            variety: '东阳',
            price: '5.20元/公斤',
            channelSource: '食品商务网',
          },
        ];
        this.supplyPricePagination.total = 3;
        this.supplyPriceLoading = false;
      }, 300);
    },

    // 行情价分页处理
    onMarketPricePageSizeChange(size) {
      this.marketPricePagination.pageSize = size;
      this.getMarketPriceData();
    },

    onMarketPriceCurrentChange(current) {
      this.marketPricePagination.pageNo = current;
      this.getMarketPriceData();
    },

    // 货源价分页处理
    onSupplyPricePageSizeChange(size) {
      this.supplyPricePagination.pageSize = size;
      this.getSupplyPriceData();
    },

    onSupplyPriceCurrentChange(current) {
      this.supplyPricePagination.pageNo = current;
      this.getSupplyPriceData();
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