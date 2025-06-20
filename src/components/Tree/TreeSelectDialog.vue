<template>
    <div class="tree-select-container">
        <!-- 简化的选择器显示 -->
        <div class="custom-select-display" @click="openDialog">
            <!-- 多选模式 -->
            <div v-if="multiple" class="multi-select-display">
                <div v-if="displayLabels.length === 0" class="placeholder">{{ placeholder }}</div>
                <div v-else class="selected-tags">
                    <!-- 只显示前maxVisibleTags个标签 -->
                    <div v-for="(item, index) in visibleLabels" :key="index" class="tag-item">
                        {{ item }}
                        <span class="tag-close" @click.stop="handleRemoveTag(index)">×</span>
                    </div>

                    <!-- 如果有更多标签，显示 +n -->
                    <div v-if="displayLabels.length > maxVisibleTags" class="tag-item more-tag">
                        +{{ displayLabels.length - maxVisibleTags }}
                    </div>
                </div>
            </div>

            <!-- 单选模式 -->
            <div v-else class="single-select-display">
                <div v-if="!displayLabel" class="placeholder">{{ placeholder }}</div>
                <div v-else class="selected-value">{{ displayLabel }}</div>
            </div>

            <div class="select-arrow">▼</div>
        </div>

        <!-- 下拉对话框 -->
        <t-dialog :visible.sync="dialogVisible" :header="title" :width="width" :footer="true" @confirm="handleConfirm"
            @close="handleCancel">
            <t-loading :loading="loading" text="正在加载数据..." :style="{ minHeight: loading ? '200px' : 'auto' }">
                <div class="tree-dialog-content">
                    <virtual-tree v-if="!loading" ref="virtualTree" :data="data" :value="tempSelectedKeys" :multiple="multiple"
                        :searchable="true" :placeholder="placeholder" :height="treeHeight" @change="handleTreeChange" />
                </div>
            </t-loading>

            <template #footer>
                <div class="dialog-footer">
                    <t-button theme="default" @click="handleCancel">取消</t-button>
                    <t-button theme="primary" :disabled="loading" @click="handleConfirm">确认</t-button>
                </div>
            </template>
        </t-dialog>
    </div>
</template>

<script>
import VirtualTree from './VirtualTree.vue';

export default {
    name: 'TreeSelectDialog',
    components: {
        VirtualTree
    },
    props: {
        value: {
            type: [String, Array],
            default: () => []
        },
        data: {
            type: Array,
            required: true
        },
        placeholder: {
            type: String,
            default: '请选择'
        },
        multiple: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: '请选择'
        },
        width: {
            type: [String, Number],
            default: 600
        },
        treeHeight: {
            type: [Number, String],
            default: 400
        },
        disabled: {
            type: Boolean,
            default: false
        },
        loading: {
            type: Boolean,
            default: false
        },
        // 添加可见标签数量配置
        maxVisibleTags: {
            type: Number,
            default: 2
        }
    },
    data() {
        return {
            dialogVisible: false,
            tempSelectedKeys: this.multiple ? (Array.isArray(this.value) ? [...this.value] : []) : this.value || '',
            displayLabels: [], // 用于多选模式展示的标签文本
            displayLabel: '',  // 用于单选模式展示的文本
        };
    },
    computed: {
        // 计算可见的标签
        visibleLabels() {
            return this.displayLabels.slice(0, this.maxVisibleTags);
        }
    },
    watch: {
        value: {
            handler(newVal) {
                this.tempSelectedKeys = this.multiple ? (Array.isArray(newVal) ? [...newVal] : []) : newVal || '';
                this.updateDisplayLabels();
            },
            immediate: true
        }
    },
    created() {
        this.updateDisplayLabels();
    },
    methods: {
        // 更新显示标签
        updateDisplayLabels() {
            if (this.multiple) {
                const selectedValues = Array.isArray(this.value) ? this.value : [];

                if (selectedValues.length === 0) {
                    this.displayLabels = [];
                    return;
                }

                // 获取标签显示文本
                this.displayLabels = selectedValues.map(val =>
                    this.findNodeLabel(val, this.data) || val
                );

                console.log('当前显示的标签:', this.displayLabels);

                if (this.displayLabels.length > this.maxVisibleTags) {
                    console.log(`显示前${this.maxVisibleTags}个标签，其余${this.displayLabels.length - this.maxVisibleTags}个折叠显示`);
                }
            } else {
                if (!this.value) {
                    this.displayLabel = '';
                    return;
                }

                this.displayLabel = this.findNodeLabel(this.value, this.data) || this.value;
            }
        },

        // 递归查找节点标签
        findNodeLabel(value, nodes) {
            if (!nodes || !nodes.length) {
                return null;
            }

            for (const node of nodes) {
                if (node.areacode === value) {
                    return node.areaname;
                }

                if (node.children && node.children.length) {
                    const childLabel = this.findNodeLabel(value, node.children);
                    if (childLabel) {
                        return childLabel;
                    }
                }
            }

            return null;
        },

        // 打开对话框
        openDialog() {
            if (!this.disabled) {
                this.dialogVisible = true;
                this.tempSelectedKeys = this.multiple ?
                    (Array.isArray(this.value) ? [...this.value] : []) :
                    this.value || '';
            }
        },

        // 处理删除标签(多选模式)
        handleRemoveTag(index) {
            if (this.multiple) {
                const selectedValues = Array.isArray(this.value) ? [...this.value] : [];

                if (index >= 0 && index < this.maxVisibleTags && index < selectedValues.length) {
                    selectedValues.splice(index, 1);
                    this.$emit('input', selectedValues);
                    this.$emit('change', selectedValues);

                    // 更新显示
                    this.updateDisplayLabels();
                }
            }
        },

        // 处理树组件选择变更
        handleTreeChange(value) {
            this.tempSelectedKeys = value;
        },

        // 确认选择
        handleConfirm() {
            console.log("选中的区域代码:", this.tempSelectedKeys);

            // 输出选中的区域名称
            if (this.multiple && Array.isArray(this.tempSelectedKeys)) {
                const selectedNames = this.tempSelectedKeys.map(key => {
                    const name = this.findNodeLabel(key, this.data);
                    console.log(`区域代码: ${key}, 区域名称: ${name}`);
                    return name;
                });
                console.log("所有选中的区域名称:", selectedNames);

                // 更新显示标签
                this.displayLabels = selectedNames;
                console.log('生成的标签:', this.displayLabels);

                if (this.displayLabels.length > this.maxVisibleTags) {
                    console.log(`显示前${this.maxVisibleTags}个标签，其余${this.displayLabels.length - this.maxVisibleTags}个折叠显示`);
                }
            } else if (this.tempSelectedKeys) {
                const name = this.findNodeLabel(this.tempSelectedKeys, this.data);
                console.log(`单选区域代码: ${this.tempSelectedKeys}, 区域名称: ${name}`);
                this.displayLabel = name || this.tempSelectedKeys;
            }

            // 提交选择结果
            this.$emit('input', this.tempSelectedKeys);
            this.$emit('change', this.tempSelectedKeys);

            // 关闭对话框
            this.dialogVisible = false;
        },

        // 取消选择
        handleCancel() {
            // 恢复原始选择
            this.tempSelectedKeys = this.multiple ?
                (Array.isArray(this.value) ? [...this.value] : []) :
                this.value || '';

            // 关闭对话框
            this.dialogVisible = false;
        },

        // 清除选择
        clear() {
            this.tempSelectedKeys = this.multiple ? [] : '';
            this.$emit('input', this.tempSelectedKeys);
            this.$emit('change', this.tempSelectedKeys);

            if (this.multiple) {
                this.displayLabels = [];
            } else {
                this.displayLabel = '';
            }
        }
    }
};
</script>

<style scoped>
.tree-select-container {
    width: 100%;
    position: relative;
}

.custom-select-display {
    border: 1px solid #dcdcdc;
    border-radius: 3px;
    padding: 4px 8px;
    min-height: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    background-color: #fff;
}

.custom-select-display:hover {
    border-color: #0052d9;
}

.placeholder {
    color: #999;
}

.selected-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.tag-item {
    background-color: #f0f0f0;
    border-radius: 2px;
    padding: 2px 6px;
    font-size: 12px;
    display: flex;
    align-items: center;
}

.more-tag {
    background-color: #e0e0e0;
    color: #666;
}

.tag-close {
    margin-left: 4px;
    font-size: 14px;
    cursor: pointer;
}

.tag-close:hover {
    color: #ff0000;
}

.select-arrow {
    color: #999;
    font-size: 12px;
}

.tree-dialog-content {
    min-height: 300px;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}
</style>