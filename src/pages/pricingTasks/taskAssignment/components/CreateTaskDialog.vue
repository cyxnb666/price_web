<template>
    <t-dialog header="创建采价任务" :visible.sync="visible" :destroyOnClose="true" :closeOnOverlayClick="false"
        @close="onClose" width="1000px" top="5%" class="create-task-dialog">
        <div class="dialog-content">
            <div class="form-container">
                <t-form ref="taskForm" :data="formData" label-width="110px">
                    <t-row :gutter="[16, 24]" :style="{ marginBottom: '10px' }">
                        <t-col :span="3">
                            <t-form-item label="行政区划" name="areaCodes">
                                <t-tree-select v-model="formData.areaCodes" filterable placeholder="请选择" clearable
                                    multiple :data="areaList" :treeProps="treeProps" />
                            </t-form-item>
                        </t-col>
                        <t-col :span="3">
                            <t-form-item label="采价点类型" name="pointType">
                                <t-select v-model="formData.pointType" placeholder="请选择" clearable multiple
                                    :options="pointTypeOptions" />
                            </t-form-item>
                        </t-col>
                        <t-col :span="3">
                            <t-form-item label="采价点归属" name="pointAffiliation">
                                <t-select v-model="formData.pointAffiliation" placeholder="请选择" clearable multiple
                                    :options="pointAffiliationOptions" />
                            </t-form-item>
                        </t-col>
                        <t-col :span="3">
                            <t-form-item label="采价点客户标识" name="customerType">
                                <t-select v-model="formData.customerType" placeholder="请选择" clearable multiple
                                    :options="customerIdentifierOptions" />
                            </t-form-item>
                        </t-col>
                    </t-row>

                    <t-row :gutter="[16, 24]" :style="{ marginBottom: '10px' }">
                        <t-col :span="3">
                            <t-form-item label="品种" name="varietyId">
                                <t-select v-model="formData.varietyId" placeholder="请选择" clearable
                                    :options="varietyOptions" />
                            </t-form-item>
                        </t-col>
                        <t-col :span="3">
                            <t-form-item label="采价时间" name="pricingTime">
                                <t-date-range-picker v-model="formData.pricingTime" value-type="YYYY-MM-DD"
                                    placeholder="起始-止期" :disableDate="disablePastDates" />
                            </t-form-item>
                        </t-col>
                        <t-col :span="3">
                            <t-form-item label="发送短信提醒" name="sendSms">
                                <t-select v-model="formData.sendSms" :options="smsReminderOptions">
                                </t-select>
                            </t-form-item>
                        </t-col>
                    </t-row>

                    <t-row :gutter="[16, 24]" :style="{ marginBottom: '10px' }">
                        <t-col :span="3">
                            <t-form-item label="采价方式" name="pricingMethod">
                                <t-select v-model="formData.pricingMethod" placeholder="请选择"
                                    :options="pricingMethodOptions">
                                </t-select>
                            </t-form-item>
                        </t-col>
                        <t-col :span="3" v-if="formData.pricingMethod === 'ratio'">
                            <t-form-item label="占比(%)" name="ratio">
                                <t-input v-model="formData.ratio" placeholder="请输入占比" />
                            </t-form-item>
                        </t-col>
                        <t-col :span="3" v-if="formData.pricingMethod === 'specific'">
                            <t-form-item label="采价点" name="specificPoint">
                                <t-select v-model="formData.specificPoint" :options="pointOptions" placeholder="请选择采价点"
                                    multiple />
                            </t-form-item>
                        </t-col>
                        <t-col :span="3">
                            <div class="action-buttons">
                                <t-button theme="default" @click="onClose">取消</t-button>
                                <t-button theme="success" @click="onPreview" style="margin-left: 8px">预览任务</t-button>
                            </div>
                        </t-col>
                    </t-row>
                </t-form>
            </div>

            <t-divider />

            <div class="preview-section">
                <div class="preview-title">采价任务预览</div>
                <div class="preview-container">
                    <!-- 预览内容区域 -->
                    <div class="task-preview" v-if="showPreview">
                        <div class="task-preview-content">
                            <t-loading :loading="previewLoading" text="加载预览数据...">
                                <t-table :data="previewData" :columns="currentColumns" bordered size="small"
                                    row-key="id">
                                    <template #district="{ row }">
                                        {{ row.district }}
                                    </template>
                                    <template #ratio="{ row }">
                                        {{ row.ratio }}%
                                    </template>
                                    <template #pointName="{ row }">
                                        {{ row.pointName }}
                                    </template>
                                    <template #pointCount="{ row }">
                                        {{ row.pointCount }}
                                    </template>
                                    <template #taskCount="{ row }">
                                        {{ row.taskCount }}
                                    </template>
                                </t-table>
                            </t-loading>
                        </div>
                    </div>
                    <div class="empty-preview" v-else>
                        <div class="placeholder-text">点击"预览任务"查看采价任务详情</div>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="dialog-footer">
                <t-button theme="primary" @click="onConfirm" :loading="confirmLoading">确定创建</t-button>

            </div>
        </template>
    </t-dialog>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'CreateTaskDialog',
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            confirmLoading: false,
            previewLoading: false,
            // 存储初始表单数据，用于重置
            initialFormData: {
                areaCodes: [],
                pointType: [],
                pointAffiliation: [],
                customerType: [],
                varietyId: '',
                pricingTime: [],
                pricingMethod: 'ratio',
                ratio: 30,
                specificPoint: [],
                sendSms: true,
            },
            formData: {
                areaCodes: [],
                pointType: [],
                pointAffiliation: [],
                customerType: [],
                varietyId: '',
                pricingTime: [],
                pricingMethod: 'ratio',
                ratio: 30,
                specificPoint: [],
                sendSms: true,
            },
            // 树形控件属性
            treeProps: {
                keys: {
                    label: 'areaname',
                    value: 'areacode',
                    children: 'children',
                }
            },

            // 表单选项数据
            areaList: [],
            pointTypeOptions: [],
            pointAffiliationOptions: [],
            customerIdentifierOptions: [
                { label: '客户', value: '1' },
                { label: '非客户', value: '0' },
            ],
            varietyOptions: [],
            pointOptions: [],
            pricingMethodOptions: [
                { label: '区域占比', value: 'ratio' },
                { label: '指定采价点', value: 'specific' },
            ],
            smsReminderOptions: [
                { label: '是', value: true },
                { label: '否', value: false },
            ],

            showPreview: false, // 控制是否显示预览数据
            currentColumns: [], // 当前显示的列
            ratioColumns: [
                { colKey: 'district', title: '行政区划', width: '200' },
                { colKey: 'ratio', title: '区域占比%', width: '100' },
                { colKey: 'pointCount', title: '采价点总数', width: '100' },
                { colKey: 'taskCount', title: '采价数', width: '100' },
            ],
            specificColumns: [
                { colKey: 'district', title: '行政区划', width: '200' },
                { colKey: 'pointName', title: '采价点', width: '250' },
            ],
            previewData: [], // 实际显示的预览数据
        };
    },
    watch: {
        // 监听弹窗可见性变化
        visible(newVal) {
            if (newVal) {
                this.initFormData();
            }
        },
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
    methods: {
        // 初始化表单数据和下拉选项
        initFormData() {
            // 重置表单为初始状态
            this.resetForm();

            // 获取下拉选项数据
            this.getAreaList();
            this.getPointTypeOptions();
            this.getPointAffiliationOptions();
            this.getVarietyOptions();
            this.getPointOptions();
        },

        formatDateRange(dateRange) {
            if (!dateRange || dateRange.length !== 2) return '';
            return `${dateRange[0]} 至 ${dateRange[1]}`;
        },

        disablePastDates(date) {
            // 禁用今天之前的日期
            return date < new Date(new Date().setHours(0, 0, 0, 0));
        },

        // 重置表单和预览状态
        resetForm() {
            // 深拷贝初始表单数据
            this.formData = JSON.parse(JSON.stringify(this.initialFormData));
            this.showPreview = false;
            this.previewData = [];
        },

        onClose() {
            // 重置表单和预览状态
            this.resetForm();
            this.$emit('close');
        },

        // 预览任务
        onPreview() {
            // 验证必填字段
            const requiredFields = ['areaCodes', 'pointType', 'pointAffiliation', 'customerType', 'varietyId', 'pricingTime'];

            // 根据采价方式添加特定必填字段
            if (this.formData.pricingMethod === 'ratio') {
                requiredFields.push('ratio');
            } else if (this.formData.pricingMethod === 'specific') {
                requiredFields.push('specificPoint');
            }

            // 验证字段是否都已填写
            const missingFields = requiredFields.filter(field => {
                const value = this.formData[field];
                if (Array.isArray(value)) {
                    return value.length === 0;
                }
                return value === '' || value === null || value === undefined;
            });

            if (missingFields.length > 0) {
                // 构建字段映射表
                const fieldNameMap = {
                    areaCodes: '行政区划',
                    pointType: '采价点类型',
                    pointAffiliation: '采价点归属',
                    customerType: '采价点客户标识',
                    varietyId: '品种',
                    pricingTime: '采价时间',
                    ratio: '占比',
                    specificPoint: '采价点'
                };

                // 获取缺失字段的名称
                const missingFieldNames = missingFields.map(field => fieldNameMap[field]);

                this.$message.warning(`请填写必填项: ${missingFieldNames.join(', ')}`);
                return;
            }

            // 如果选择了区域占比，验证比率是否为有效数字
            if (this.formData.pricingMethod === 'ratio') {
                const ratio = parseFloat(this.formData.ratio);
                if (isNaN(ratio) || ratio <= 0 || ratio > 100) {
                    this.$message.warning('占比必须是0-100之间的有效数字');
                    return;
                }
            }

            // 加载状态
            this.showPreview = true;
            this.previewLoading = true;

            const apiParams = {
                condition: {
                    // 基础参数
                    areaCodes: this.formData.areaCodes,
                    stallType: this.formData.pointType,
                    stallVest: this.formData.pointAffiliation,
                    customerIdentification: this.formData.customerType,
                    varietyId: parseInt(this.formData.varietyId, 10),

                    // 日期参数
                    collectBgnDate: this.formData.pricingTime[0],
                    collectEndDate: this.formData.pricingTime[1],

                    // 转换为1-0
                    isSmsMessages: this.formData.sendSms ? "1" : "0",

                    // 转换采价方式
                    collectType: this.formData.pricingMethod === 'ratio' ? "1" : "2",
                }
            };

            // 根据采价方式添加特定字段
            if (this.formData.pricingMethod === 'ratio') {
                apiParams.condition.collectRate = parseInt(this.formData.ratio, 10);
            } else {
                apiParams.condition.stallId = this.formData.specificPoint;
            }

            console.log('预览参数:', apiParams);

            this.$request
                .post('/web/taskScheduling/previewTheTaskSchedule', apiParams)
                .then((res) => {
                    if (res.retCode === 200) {
                        const previewData = res.retData;

                        if (this.formData.pricingMethod === 'ratio') {
                            this.currentColumns = this.ratioColumns;

                            this.previewData = (previewData.previews || []).map((item, index) => ({
                                id: index + 1,
                                district: item.areaname || '',
                                ratio: item.collectRate || 0,
                                pointCount: item.stallCount || 0,
                                taskCount: item.collectCount || 0
                            }));
                        } else {
                            this.currentColumns = this.specificColumns;
                            this.previewData = (previewData.previews || []).map((item, index) => ({
                                id: index + 1,
                                district: item.areaname || '',
                                pointName: item.stallName || ''
                            }));
                        }

                        // 如果没有数据就显示提示
                        if (this.previewData.length === 0) {
                            this.$message.info('没有符合条件的预览数据');
                        }
                    } else {
                        this.$message.error(res.retMsg || '获取预览数据失败');
                        this.showPreview = false;
                    }
                })
                .catch((e) => {
                    console.error(e);
                    this.$message.error('获取预览数据失败');
                    this.showPreview = false;
                })
                .finally(() => {
                    this.previewLoading = false;
                });
        },

        onConfirm() {
            const requiredFields = ['areaCodes', 'pointType', 'pointAffiliation', 'customerType', 'varietyId', 'pricingTime'];

            if (this.formData.pricingMethod === 'ratio') {
                requiredFields.push('ratio');
            } else if (this.formData.pricingMethod === 'specific') {
                requiredFields.push('specificPoint');
            }

            const missingFields = requiredFields.filter(field => {
                const value = this.formData[field];
                if (Array.isArray(value)) {
                    return value.length === 0;
                }
                return value === '' || value === null || value === undefined;
            });

            if (missingFields.length > 0) {
                const fieldNameMap = {
                    areaCodes: '行政区划',
                    pointType: '采价点类型',
                    pointAffiliation: '采价点归属',
                    customerType: '采价点客户标识',
                    varietyId: '品种',
                    pricingTime: '采价时间',
                    ratio: '占比',
                    specificPoint: '采价点'
                };

                const missingFieldNames = missingFields.map(field => fieldNameMap[field]);

                this.$message.warning(`请填写必填项: ${missingFieldNames.join(', ')}`);
                return;
            }

            // 如果选择了区域占比，验证比率是否为有效数字
            if (this.formData.pricingMethod === 'ratio') {
                const ratio = parseFloat(this.formData.ratio);
                if (isNaN(ratio) || ratio <= 0 || ratio > 100) {
                    this.$message.warning('占比必须是0-100之间的有效数字');
                    return;
                }
            }

            const apiParams = {
                condition: {
                    areaCodes: this.formData.areaCodes,
                    stallType: this.formData.pointType,
                    stallVest: this.formData.pointAffiliation,
                    customerIdentification: this.formData.customerType,
                    varietyId: parseInt(this.formData.varietyId, 10),
                    collectBgnDate: this.formData.pricingTime[0],
                    collectEndDate: this.formData.pricingTime[1],
                    isSmsMessages: this.formData.sendSms ? "1" : "0",
                    collectType: this.formData.pricingMethod === 'ratio' ? "1" : "2",
                    taskSource: "1",
                }
            };

            if (this.formData.pricingMethod === 'ratio') {
                apiParams.condition.collectRate = parseInt(this.formData.ratio, 10);
            } else {
                apiParams.condition.stallId = this.formData.specificPoint;
            }

            console.log('提交参数:', apiParams);

            this.confirmLoading = true;
            this.$request
                .post('/web/taskScheduling/saveTaskScheduling', apiParams)
                .then((res) => {
                    if (res.retCode === 200) {
                        this.$emit('confirm', this.formData);
                        this.onClose();
                    } else {
                        this.$message.error(res.retMsg || '创建任务失败');
                    }
                })
                .catch((e) => {
                    console.error(e);
                    this.$message.error('创建任务失败');
                })
                .finally(() => {
                    this.confirmLoading = false;
                });
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
                    stallType: this.formData.pointType || [],
                    stallVests: this.formData.pointAffiliation || [],
                    areacodes: this.formData.areaCodes || [],
                },
            };

            this.$request
                .post('/web/stall/selectChooseStalls2', params)
                .then((res) => {
                    if (res.retCode === 200) {
                        this.pointOptions = [];

                        if (res.retData && res.retData.length > 0) {
                            const options = res.retData.map((item) => ({
                                label: item.stallName,
                                value: item.stallId,
                            }));

                            this.pointOptions = [...this.pointOptions, ...options];
                        }

                        // 如果有当前选中的采价点在新的选项中不存在，则过滤掉这些采价点
                        if (this.formData.specificPoint && this.formData.specificPoint.length > 0) {
                            const validOptions = this.pointOptions.map(option => option.value);
                            this.formData.specificPoint = this.formData.specificPoint.filter(point =>
                                validOptions.includes(point)
                            );
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
                        this.varietyOptions = [];

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
    }
});
</script>

<style lang="less" scoped>
.create-task-dialog {
    :deep(.t-dialog__header) {
        font-weight: bold;
    }

    .dialog-content {
        padding: 0 20px;
    }

    .form-container {
        margin-bottom: 20px;
    }

    .action-buttons {
        display: flex;
        justify-content: flex-start;
        align-items: flex-end;
        height: 100%;
        padding-bottom: 4px;
    }

    .preview-section {
        margin-top: 20px;
        margin-bottom: 20px;

        .preview-title {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 16px;
        }
    }

    .preview-container {
        display: flex;
        gap: 20px;
        height: 400px; // 固定高度

        .task-preview {
            flex: 1;
            border: 1px solid #e7e7e7;
            border-radius: 4px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            height: 100%;

            .task-info {
                margin-bottom: 16px;

                .task-info-item {
                    margin-left: 20px;
                }
            }

            .task-preview-content {
                flex: 1;
                overflow-y: auto; // 添加垂直滚动条

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

        .empty-preview {
            flex: 1;
            border: 1px solid #e7e7e7;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f9f9f9;
            height: 100%;

            .placeholder-text {
                color: #999;
                font-size: 14px;
            }
        }
    }

    .dialog-footer {
        display: flex;
        justify-content: center;
    }
}
</style>