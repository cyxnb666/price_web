<template>
    <div>
        <t-card class="list-card-container" :bordered="false">
            <t-form ref="form" :data="formData" :label-width="80" colon @reset="onReset" @submit="onSearch">
                <t-row :gutter="[16, 24]" :style="{ marginBottom: '10px' }">
                    <t-col :span="3">
                        <t-form-item label="行政区划" name="areaCodes">
                            <t-tree-select clearable v-model="formData.areaCodes" class="form-item-content"
                                :data="areaList" :treeProps="treeProps" placeholder="请选择行政区划" multiple />
                        </t-form-item>
                    </t-col>
                    <t-col :span="3">
                        <t-form-item label="采价点类型" name="pointType">
                            <t-select clearable v-model="formData.pointType" class="form-item-content"
                                :options="pointTypeOptions" placeholder="请选择采价点类型" />
                        </t-form-item>
                    </t-col>
                    <t-col :span="3">
                        <t-form-item label="采价点归属" name="pointAffiliation">
                            <t-select clearable v-model="formData.pointAffiliation" class="form-item-content"
                                :options="pointAffiliationOptions" placeholder="请选择采价点归属" />
                        </t-form-item>
                    </t-col>
                    <t-col :span="3">
                        <t-form-item label="客户标识" name="customerIdentification">
                            <t-select clearable v-model="formData.customerIdentification" class="form-item-content"
                                :options="customerIdentifierOptions" placeholder="请选择客户标识" />
                        </t-form-item>
                    </t-col>
                </t-row>

                <t-row :gutter="[16, 24]">
                    <t-col :span="3">
                        <t-form-item label="采价点" name="pointId">
                            <t-select clearable v-model="formData.pointId" class="form-item-content"
                                :options="pointOptions" placeholder="请选择采价点" />
                        </t-form-item>
                    </t-col>
                    <t-col :span="3">
                        <t-form-item label="品种" name="varietyId">
                            <t-select clearable v-model="formData.varietyId" class="form-item-content"
                                :options="varietyOptions" placeholder="请选择品种" />
                        </t-form-item>
                    </t-col>
                    <t-col :span="3">
                        <t-form-item label="任务状态" name="taskStatus">
                            <t-select clearable v-model="formData.taskStatus" class="form-item-content"
                                :options="taskStatusOptions" placeholder="请选择任务状态" />
                        </t-form-item>
                    </t-col>
                </t-row>

                <t-row :gutter="20" style="margin-top: 16px">
                    <t-col :span="24">
                        <div class="operation-container" style="display: flex; justify-content: flex-end">
                            <t-button theme="primary" type="submit">查询</t-button>
                            <t-button type="reset" variant="base" theme="default"
                                :style="{ marginLeft: '8px' }">重置</t-button>
                            <t-button theme="primary" :style="{ marginLeft: '8px' }"
                                @click="openCreateDialog">新增</t-button>
                        </div>
                    </t-col>
                </t-row>
            </t-form>

            <div class="table-container">
                <t-table :columns="columns" :data="data" :rowKey="rowKey" :verticalAlign="verticalAlign" :hover="hover"
                    :pagination="pagination" :loading="loading" :headerAffixedTop="true" height="calc(100vh - 420px)">
                    <template #customerIdentifier="{ row }">
                        <span v-if="row.customerIdentifier.includes('客户')">
                            <span>{{ row.customerIdentifier }}</span>
                        </span>
                        <span v-else>{{ row.customerIdentifier }}</span>
                    </template>

                    <template #status="{ row }">
                        <t-tag v-if="row.status === '0'" theme="default" variant="light">待开始</t-tag>
                        <t-tag v-if="row.status === '1'" theme="primary" variant="light">计划执行中</t-tag>
                        <t-tag v-if="row.status === '2'" theme="warning" variant="light">任务终止</t-tag>
                        <t-tag v-if="row.status === '3'" theme="success" variant="light">任务结束</t-tag>
                    </template>

                    <template #op="slotProps">
                        <t-button theme="primary" variant="text" class="t-button-link"
                            style="color: #0052d9; padding: 0px 0px 10px 0px"
                            @click="handleViewDetails(slotProps)">任务详情</t-button>
                        <t-button v-if="slotProps.row.canTerminate" theme="warning" variant="text" class="t-button-link"
                            style="color: #ed7b2f; padding: 0px 0px 10px 0px"
                            @click="handleTerminate(slotProps)">计划终止</t-button>
                        <t-button v-if="slotProps.row.canDelete" theme="danger" variant="text" class="t-button-link"
                            style="color: #e34d59; padding: 0px 0px 10px 0px"
                            @click="handleDelete(slotProps)">删除</t-button>
                    </template>
                </t-table>
            </div>
            <div class="pagination">
                <t-pagination showFirstAndLastPageBtn :total="pagination.total" :default-current="pagination.pageNo"
                    :default-page-size="pagination.pageSize" @current-change="onCurrentChange"
                    @page-size-change="onPageSizeChange" />
            </div>
        </t-card>

        <!-- 新增上报计划对话框 -->
        <create-report-dialog :visible="createDialogVisible" @close="createDialogVisible = false"
            @confirm="handleCreateReport" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { prefix } from '@/config/global';
import CreateReportDialog from './components/CreateReportDialog.vue';

export default Vue.extend({
    name: 'PriceLocationReportPlan',
    components: {
        CreateReportDialog,
    },
    data() {
        return {
            prefix,
            loading: false,
            createDialogVisible: false,
            data: [],
            columns: [
                {
                    title: '计划编号',
                    align: 'left',
                    width: 150,
                    ellipsis: true,
                    colKey: 'id',
                    fixed: 'left',
                },
                {
                    title: '行政区划',
                    align: 'left',
                    width: 150,
                    ellipsis: true,
                    colKey: 'area',
                },
                {
                    title: '品种',
                    width: 100,
                    ellipsis: true,
                    colKey: 'category',
                },
                {
                    title: '采价点类型',
                    width: 120,
                    ellipsis: true,
                    colKey: 'pointType',
                },
                {
                    title: '采价点归属',
                    width: 120,
                    ellipsis: true,
                    colKey: 'pointAffiliation',
                },
                {
                    title: '采价点客户标识',
                    width: 150,
                    ellipsis: true,
                    colKey: 'customerIdentifier',
                },
                {
                    title: '上报周期(天)',
                    width: 120,
                    ellipsis: true,
                    colKey: 'reportPeriod',
                },
                {
                    title: '计划周期',
                    width: 180,
                    ellipsis: true,
                    colKey: 'planPeriod',
                },
                {
                    title: '任务计划状态',
                    width: 120,
                    ellipsis: true,
                    colKey: 'status',
                },
                {
                    title: '任务创建人',
                    width: 100,
                    ellipsis: true,
                    colKey: 'creator',
                },
                {
                    align: 'left',
                    fixed: 'right',
                    width: 180,
                    colKey: 'op',
                    title: '操作',
                },
            ],
            formData: {
                areaCodes: [],
                pointType: '',
                pointAffiliation: '',
                customerIdentification: '',
                pointId: '',
                varietyId: '',
                taskStatus: '',
            },
            areaList: [],
            pointTypeOptions: [{ label: '全部', value: '' }],
            pointAffiliationOptions: [{ label: '全部', value: '' }],
            customerIdentifierOptions: [
                { label: '全部', value: '' },
                { label: '客户', value: '1' },
                { label: '非客户', value: '0' },
            ],
            pointOptions: [{ label: '全部', value: '' }],
            varietyOptions: [{ label: '全部', value: '' }],
            taskStatusOptions: [
                { label: '全部', value: '' },
                { label: '待开始', value: '0' },
                { label: '计划执行中', value: '1' },
                { label: '任务终止', value: '2' },
                { label: '任务结束', value: '3' },
            ],
            rowKey: 'id',
            verticalAlign: 'top',
            hover: true,
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
        // 监听行政区划变化
        'formData.areaCodes': function (newVal) {
            this.getPointOptions();
        },
        // 监听采价点归属变化
        'formData.pointAffiliation': function (newVal) {
            this.getPointOptions();
        },
        // 监听采价点类型变化
        'formData.pointType': function (newVal) {
            this.getPointOptions();
        },
    },
    mounted() {
        this.getList();
        this.getAreaList();
        this.getPointTypeOptions();
        this.getPointAffiliationOptions();
        this.getPointOptions();
        this.getVarietyOptions();
    },
    methods: {
        onSearch() {
            this.getList(true);
        },
        onReset() {
            this.$set(this.$data, 'formData', this.$options.data().formData);
            this.getList(true);
            this.getPointOptions();
        },
        getList(isSearch = false) {
            if (isSearch) {
                this.pagination.pageNo = 1;
            }

            this.loading = true;

            const params = {
                condition: {
                    areaCodes: this.formData.areaCodes || [],
                    stallType: this.formData.pointType,
                    stallVest: this.formData.pointAffiliation,
                    customerIdentification: this.formData.customerIdentification,
                    stallId: this.formData.pointId ? [this.formData.pointId] : [],
                    varietyId: this.formData.varietyId,
                    taskStatus: this.formData.taskStatus,
                },
                pageNo: this.pagination.pageNo,
                pageSize: this.pagination.pageSize,
            };

            this.$request
                .post('/web/reportPlan/pageQueryReportPlan', params)
                .then((res) => {
                    if (res.retCode === 200) {
                        this.data = (res.retData.records || []).map((item) => {
                            return {
                                id: item.reportPlanId || '',
                                area: item.areaname || '',
                                category: item.varietyName || '',
                                pointType: item.stallTypeName || '',
                                pointAffiliation: item.stallVestName || '',
                                customerIdentifier: this.formatCustomerIdentifier(item.customerIdentification),
                                reportPeriod: item.reportCycle || '',
                                planPeriod: `${item.planBgnDate || ''}-${item.planEndDate || ''}`,
                                status: item.taskStatus || '',
                                creator: item.creatorName || '',
                                canTerminate: item.taskStatus === '1',
                                canDelete: item.taskStatus === '0',
                            };
                        });
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
                    this.loading = false;
                });
        },
        formatCustomerIdentifier(value) {
            if (value === '1') return '客户';
            if (value === '0') return '非客户';
            if (value === '') return '客户、非客户';
            return '';
        },
        getAreaList() {
            this.$request
                .post('/web/area/selectUserDataAreaTree')
                .then((res) => {
                    if (res.retCode === 200) {
                        this.areaList = res.retData || [];
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
                        this.pointTypeOptions = [{ label: '全部', value: '' }];

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
                        this.pointAffiliationOptions = [{ label: '全部', value: '' }];

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
                    stallType: this.formData.pointType,
                    stallVests: this.formData.pointAffiliation ? [this.formData.pointAffiliation] : [],
                    areacodes: this.formData.areaCodes || [],
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

                        if (this.formData.pointId && !this.pointOptions.some((option) => option.value === this.formData.pointId)) {
                            this.formData.pointId = '';
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
        onCurrentChange(current) {
            this.pagination.pageNo = current;
            this.getList();
        },
        onPageSizeChange(size) {
            this.pagination.pageSize = size;
            this.getList();
        },
        openCreateDialog() {
            this.createDialogVisible = true;
        },
        handleCreateReport(formData) {
            // 处理创建上报计划的逻辑
            console.log('创建上报计划:', formData);
            this.createDialogVisible = false;
            this.$message.success('创建上报计划成功');
            this.getList(); // 刷新列表
        },
        handleViewDetails({ row }) {
            this.$router.push({
                name: 'priceLocationReportPlanDetail',
                params: { id: row.id }
            });
        },
        handleTerminate({ row }) {
            // 弹出确认对话框
            this.$dialog.confirm({
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
                    // 使用不同的API端点
                    this.$request.post('/web/reportPlan/terminateReportPlan', row.id)
                        .then(res => {
                            if (res.retCode === 200) {
                                this.$message.success('计划已成功终止');
                                this.getList();
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
        handleDelete({ row }) {
            // 弹出确认对话框
            this.$dialog.confirm({
                header: '删除计划',
                body: '确定要删除该计划吗？删除后无法恢复。',
                confirmBtn: {
                    content: '确定',
                    theme: 'danger',
                },
                cancelBtn: {
                    content: '取消',
                    theme: 'default',
                },
                onConfirm: () => {
                    // 使用不同的API端点
                    this.$request.delete('/web/reportPlan/deleteReportPlan', {
                        data: row.id
                    })
                        .then(res => {
                            if (res.retCode === 200) {
                                this.$message.success('计划已成功删除');
                                this.getList();
                            } else {
                                this.$message.error(res.retMsg || '删除计划失败');
                            }
                        })
                        .catch(err => {
                            console.error(err);
                            this.$message.error('删除计划失败');
                        });
                },
            });
        }
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