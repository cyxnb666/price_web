<template>
  <div>
    <t-card class="list-card-container" :bordered="false">
      <t-form
        ref="form"
        :data="formData"
        :label-width="80"
        colon
        @reset="onReset"
        @submit="onSearch"
        :style="{ marginBottom: '40px' }"
      >
        <t-row :gutter="20">
          <t-col :xxl="10" :xl="9">
            <t-row :gutter="[16, 24]">
              <t-col>
                <t-form-item label="行政区划" name="areacodes">
                  <t-tree-select
                    clearable
                    multiple
                    :minCollapsedNum="minCollapsedNum"
                    style="width: 160px"
                    v-model="formData.areacodes"
                    :treeProps="treeProps"
                    :data="areaList"
                    placeholder="请选择"
                  />
                </t-form-item>
              </t-col>
              <t-col>
                <t-form-item label="采价点">
                  <t-input
                    v-model="formData.stallName"
                    class="form-item-content"
                    placeholder="请输入"
                    style="width: 160px"
                  />
                </t-form-item>
              </t-col>
              <t-col>
                <t-form-item label="采价点类型">
                  <t-select
                    clearable
                    v-model="formData.stallType"
                    style="width: 160px"
                    class="form-item-content"
                    :options="stallTypeList"
                    placeholder="请选择采价点类型"
                  />
                </t-form-item>
              </t-col>
              <t-col>
                <t-form-item label="采价点归属">
                  <t-select
                    clearable
                    v-model="formData.stallVests"
                    style="width: 160px"
                    multiple
                    :minCollapsedNum="minCollapsedNum"
                    class="form-item-content"
                    :options="stallVestsList"
                    placeholder="请选择采价点归属"
                  />
                </t-form-item>
              </t-col>
              <t-col>
                <t-form-item label="品种">
                  <t-select
                    clearable
                    v-model="formData.varietyIds"
                    style="width: 160px"
                    multiple
                    :minCollapsedNum="minCollapsedNum"
                    class="form-item-content"
                    :options="FruiveggieVarietyList"
                    placeholder="请选择品种"
                  />
                </t-form-item>
              </t-col>
            </t-row>
          </t-col>
          <t-col :xxl="2" :xl="3" class="operation-container">
            <t-button type="reset" variant="base" theme="default"> 重置 </t-button>
            <t-button theme="primary" type="submit" :style="{ marginLeft: '8px' }"> 查询 </t-button>
          </t-col>
        </t-row>
      </t-form>
      <div class="table-container">
        <t-table
          :columns="columns"
          :data="data"
          :rowKey="rowKey"
          :verticalAlign="verticalAlign"
          :hover="hover"
          :pagination="pagination"
          :loading="dataLoading"
          :headerAffixedTop="true"
          :headerAffixProps="{ offsetTop: offsetTop }"
        >
          <template #linkerName="{ row }">
            {{ row.linkers && row.linkers.length > 0 ? row.linkers.map((v) => v.linkerName).join(',') : '' }}
          </template>
          <template #linkerMobile="{ row }">
            {{ row.linkers && row.linkers.length > 0 ? row.linkers.map((v) => v.linkerMobile).join(',') : '' }}
          </template>
        </t-table>
      </div>
      <div class="pagination">
        <t-pagination
          showFirstAndLastPageBtn
          :total="pagination.total"
          :default-current="pagination.pageNo"
          :default-page-size="pagination.pageSize"
          @current-change="onCurrentChange"
          @page-size-change="onPageSizeChange"
        />
      </div>
    </t-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { prefix } from '@/config/global';

export default Vue.extend({
  name: 'ListBase',
  data() {
    return {
      prefix,
      dataLoading: false,
      data: [],
      minCollapsedNum: 1,
      FruiveggieVarietyList: [],
      stallVestsList: [],
      columns: [
        {
          title: '编号',
          align: 'left',
          width: 200,
          ellipsis: true,
          colKey: 'stallId',
          fixed: 'left',
        },
        {
          title: '采价点名称',
          width: 200,
          ellipsis: true,
          colKey: 'stallName',
        },
        {
          title: '采价品种',
          width: 150,
          ellipsis: true,
          colKey: 'varietyName',
        },
        {
          title: '采价点类型',
          width: 150,
          ellipsis: true,
          colKey: 'stallTypeCnm',
        },
        {
          title: '采价点来源',
          width: 150,
          ellipsis: true,
          colKey: 'stallVestName',
        },
        {
          title: '联系人',
          width: 120,
          ellipsis: true,
          colKey: 'linkerName',
        },
        {
          title: '联系电话',
          width: 150,
          ellipsis: true,
          colKey: 'linkerMobile',
        },
        {
          title: '创建人',
          width: 120,
          ellipsis: true,
          colKey: 'createBy',
        },
        {
          title: '时间',
          width: 180,
          ellipsis: true,
          colKey: 'createTime',
        },
        {
          title: '行政区划',
          width: 200,
          ellipsis: true,
          colKey: 'areaname',
        },
        {
          title: '详细地址',
          width: 250,
          ellipsis: true,
          colKey: 'stallAddress',
        },
      ],
      formData: {
        areacodes: [],
        stallName: '',
        stallState: '0',
        stallType: '',
        stallVests: [],
        varietyIds: [],
      },
      rowKey: 'stallId',
      tableLayout: 'auto',
      verticalAlign: 'top',
      hover: true,
      areaList: [],
      stallTypeList: [],
      rowClassName: (rowKey: string) => `${rowKey}-class`,
      // 与pagination对齐
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
  computed: {
    offsetTop() {
      return this.$store.state.setting.isUseTabsRouter ? 48 : 0;
    },
  },
  mounted() {
    this.getList();
    this.getAreaList();
    this.getstallVestsList();
    this.getstallTypeList();
    this.getFruiveggieVarietyList();
  },

  methods: {
    getFruiveggieVarietyList() {
      this.$request.post('/web/variety/selectButtomVarieties').then((res) => {
        if (res.retCode == 200) {
          this.FruiveggieVarietyList =
            res.retData.map((v) => {
              return {
                value: v.varietyId,
                label: v.varietyName,
              };
            }) || [];
        }
      });
    },
    getstallTypeList() {
      this.$request
        .post('/web/dict/queryTypeDicts', {
          condition: { dictType: 'STALL_TYPE' },
        })
        .then((res) => {
          if (res.retCode == 200) {
            this.stallTypeList =
              res.retData.map((v) => {
                return {
                  value: v.dictCode,
                  label: v.dictValue,
                };
              }) || [];
          }
        });
    },
    getstallVestsList() {
      this.$request
        .post('/web/dict/queryTypeDicts', {
          condition: { dictType: 'VEST_TYPE' },
        })
        .then((res) => {
          if (res.retCode == 200) {
            this.stallVestsList =
              res.retData.map((v) => {
                return {
                  value: v.dictCode,
                  label: v.dictValue,
                };
              }) || [];
          }
        });
    },
    getAreaList() {
      this.$request
        .get('/web/area/selectWholeAreaTrees')
        .then((res) => {
          if (res.retCode === 200) {
            this.areaList = res.retData || [];
          }
        })
        .catch((e: Error) => {
          console.log(e);
        });
    },
    onSearch() {
      this.getList(true);
    },
    onReset() {
      this.$set(this.$data, 'formData', this.$options.data().formData);
      this.getList(true);
    },
    getList(type) {
      type && (this.pagination.pageNo = 1);
      this.dataLoading = true;
      let params = {
        condition: {
          ...this.formData,
        },
        pageNo: this.pagination.pageNo,
        pageSize: this.pagination.pageSize,
      };
      this.$request
        .post('/web/stall/pageQueryCollectStalls', params)
        .then((res) => {
          const { records = [], total } = res.retData;
          this.data = records;
          this.pagination = {
            ...this.pagination,
            total,
          };
        })
        .catch((e: Error) => {
          console.log(e);
        })
        .finally(() => {
          this.dataLoading = false;
        });
    },
    onPageSizeChange(size, pageInfo) {
      this.pagination.pageSize = size;
      this.getList();
    },
    onCurrentChange(current, pageInfo) {
      this.pagination.pageNo = current;
      this.getList();
    },
  },
});
</script>

<style lang="less" scoped>
.list-common-table {
  background-color: var(--td-bg-color-container);
  padding: 30px 32px;
  border-radius: var(--td-radius-default);
}

@import '@/style/variables';

.left-operation-container {
  padding: 0 0 6px 0;
  margin-bottom: 16px;

  .selected-count {
    display: inline-block;
    margin-left: var(--td-comp-margin-s);
    color: var(--td-text-color-secondary);
  }
}

.search-input {
  width: 360px;
}

.t-button + .t-button {
  margin-left: var(--td-comp-margin-s);
}
</style>