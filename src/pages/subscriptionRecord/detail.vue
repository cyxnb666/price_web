<template>
    <t-loading :loading="loading" text="加载中...">
        <t-card :bordered="false" class="list-card-container">
            <div class="detail-container">
                <div class="section">
                    <div class="section-title">
                        <span class="section-title-marker"></span>
                        <span>基础信息</span>
                    </div>

                    <div>
                        <t-row :gutter="[16, 24]">
                            <t-col :span="3">
                                <div class="field-item">
                                    <label>上报价格归属</label>
                                    <t-input v-model="basicInfo.areaname" disabled placeholder="" />
                                </div>
                            </t-col>
                            <t-col :span="3">
                                <div class="field-item">
                                    <label>订购来源</label>
                                    <t-input v-model="orderSourceDisplay" disabled placeholder="" />
                                </div>
                            </t-col>
                            <t-col :span="3">
                                <div class="field-item">
                                    <label>品类</label>
                                    <t-input v-model="basicInfo.categoryName" disabled placeholder="" />
                                </div>
                            </t-col>
                            <t-col :span="3">
                                <div class="field-item">
                                    <label>品种</label>
                                    <t-input v-model="basicInfo.varietyName" disabled placeholder="" />
                                </div>
                            </t-col>
                        </t-row>

                        <t-row :gutter="[16, 24]">
                            <t-col :span="3">
                                <div class="field-item">
                                    <label>预采购时间</label>
                                    <t-input v-model="basicInfo.collectMonth" disabled placeholder="" />
                                </div>
                            </t-col>
                            <t-col :span="3">
                                <div class="field-item">
                                    <label>上报时间</label>
                                    <t-input v-model="basicInfo.collectTime" disabled placeholder="" />
                                </div>
                            </t-col>
                            <t-col :span="3">
                                <div class="field-item">
                                    <label>上报人</label>
                                    <t-input v-model="basicInfo.registUserName" disabled placeholder="" />
                                </div>
                            </t-col>
                        </t-row>
                    </div>
                </div>

                <div class="section" v-if="showPlanterInfo">
                    <div class="section-title">
                        <span class="section-title-marker"></span>
                        <span>订购信息</span>
                    </div>

                    <div>
                        <t-row :gutter="[16, 24]">
                            <t-col :span="3">
                                <div class="field-item">
                                    <label>种植户姓名</label>
                                    <t-input v-model="subscriptionInfo.farmerName" disabled placeholder="" />
                                </div>
                            </t-col>
                            <t-col :span="3">
                                <div class="field-item">
                                    <label>身份证号码</label>
                                    <t-input v-model="subscriptionInfo.farmerCardNo" disabled placeholder="" />
                                </div>
                            </t-col>
                            <t-col :span="3">
                                <div class="field-item">
                                    <label>果园定位</label>
                                    <t-input v-model="subscriptionInfo.collectAddress" disabled placeholder="" />
                                </div>
                            </t-col>
                            <t-col :span="3">
                                <div class="field-item">
                                    <label>种植户电话</label>
                                    <t-input v-model="subscriptionInfo.farmerMobile" disabled placeholder="" />
                                </div>
                            </t-col>
                        </t-row>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">
                        <span class="section-title-marker"></span>
                        <span>价格信息</span>
                    </div>

                    <div class="price-info">
                        <t-table :data="priceData" :columns="priceColumns" rowKey="collectSpecsId" bordered>
                            <template #specsTypeName="{ row }">
                                <span>{{ row.specsTypeName }}</span>
                            </template>
                            <template #fvSpecs="{ row }">
                                <span>{{ row.fvSpecs }}</span>
                            </template>
                            <template #unitPriceStr="{ row }">
                                <span>{{ row.unitPriceStr }}</span>
                            </template>
                            <template #weight="{ row }">
                                <span>{{ row.weight }}</span>
                            </template>
                        </t-table>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">
                        <span class="section-title-marker"></span>
                        <span>订购凭据</span>
                    </div>

                    <div class="evidence-section">
                        <div class="credentials-container">
                            <t-image-viewer v-for="(file, index) in subscriptionImageFiles" :key="file.fileId"
                                :default-index="index" :images="subscriptionImageUrls">
                                <template #trigger="{ open }">
                                    <div class="tdesign-demo-image-viewer__ui-image tdesign-demo-image-viewer__base">
                                        <img :alt="file.fileName" :src="file.fileUrl"
                                            class="tdesign-demo-image-viewer__ui-image--img" />
                                        <div class="tdesign-demo-image-viewer__ui-image--hover" @click="open">
                                            <span><browse-icon size="1.4em" /> 预览</span>
                                        </div>
                                    </div>
                                </template>
                            </t-image-viewer>

                            <!-- 视频文件 -->
                            <div v-for="file in subscriptionVideoFiles" :key="file.fileId" class="credential-item">
                                <div class="image-container">
                                    <icon-font name="cloud-download" class="downVideo"
                                        @click="downloadFile(file.fileId, file.fileName)" />
                                    <video :src="file.fileUrl" autoplay controls controlsList="nodownload"></video>
                                </div>
                            </div>

                            <!-- 其他类型文件 -->
                            <div v-for="file in subscriptionOtherFiles" :key="file.fileId" class="credential-item">
                                <div class="file-container" @click="handleFileClick(file)">
                                    <div class="file-icon">
                                        <i class="file-type">{{ file.fileSuffix }}</i>
                                    </div>
                                    <div class="file-name">{{ file.fileName }}</div>
                                </div>
                            </div>

                            <!-- 如果没有文件，显示占位符 -->
                            <div v-if="!subscriptionOtherFiles.length && !subscriptionVideoFiles.length && !subscriptionImageFiles.length"
                                class="credential-item">
                                <div class="image-placeholder">
                                    <div class="placeholder-x"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="action-buttons">
                    <t-button theme="default" @click="goBack">返回</t-button>
                </div>
            </div>
        </t-card>
    </t-loading>
</template>

<script lang="ts">
import Vue from 'vue';
import { BrowseIcon } from 'tdesign-icons-vue';
import { IconFont } from 'tdesign-icons-vue';

export default Vue.extend({
    name: 'SubscriptionRecordDetail',
    components: {
        BrowseIcon,
        IconFont,
    },
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            loading: false,
            basicInfo: {
                recordId: '',
                areaname: '',
                orderSource: '',
                categoryName: '',
                varietyName: '',
                collectMonth: '',
                collectTime: '',
                registUserName: '',
            },
            subscriptionInfo: {
                farmerName: '',
                farmerCardNo: '',
                collectAddress: '',
                farmerMobile: '',
            },
            priceData: [],
            priceColumns: [
                { title: '计价方式', colKey: 'specsTypeName', width: 150 },
                { title: '规格', colKey: 'fvSpecs', width: 200 },
                { title: '订购价', colKey: 'unitPriceStr', width: 150 },
                { title: '订购数量(KG)', colKey: 'weight', width: 150 },
            ],
            subscriptionFiles: [], // 订购凭据文件列表
            orderSource: '', // 用于判断是否显示种植户信息
        };
    },
    computed: {
        // 判断是否显示种植户信息
        showPlanterInfo() {
            return this.orderSource !== 'SFRM';
        },
        // 转换订购来源显示
        orderSourceDisplay() {
            const sourceMap = {
                'SFRM': '农户',
                'SMRK': '商超',
                'SAGENT': '代理商'
            };
            return sourceMap[this.basicInfo.orderSource] || this.basicInfo.orderSource;
        },
        // 订购凭据中的图片文件
        subscriptionImageFiles() {
            if (!this.subscriptionFiles) return [];
            return this.subscriptionFiles.filter((file) => this.isImageFile(file.fileSuffix));
        },
        // 订购凭据中的图片URL
        subscriptionImageUrls() {
            return this.subscriptionImageFiles.map((file) => file.fileUrl);
        },
        // 订购凭据中的视频文件
        subscriptionVideoFiles() {
            if (!this.subscriptionFiles) return [];
            return this.subscriptionFiles.filter((file) => this.isVideoFile(file.fileSuffix));
        },
        // 订购凭据中的其他文件
        subscriptionOtherFiles() {
            if (!this.subscriptionFiles) return [];
            return this.subscriptionFiles.filter(
                (file) => !this.isImageFile(file.fileSuffix) && !this.isVideoFile(file.fileSuffix),
            );
        },
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        async fetchData() {
            this.loading = true;

            const params = {
                condition: {
                    primaryKey: this.id,
                },
            };

            try {
                const res = await this.$request.post('/web/orecord/getOrderRecord', params);
                if (res.retCode === 200) {
                    const data = res.retData;
                    console.log('订购记录详情数据:', data);

                    // 设置基础信息
                    this.basicInfo = {
                        recordId: data.recordId || '',
                        areaname: data.areaname || '',
                        orderSource: data.orderSource || '',
                        categoryName: data.categoryName || '',
                        varietyName: data.varietyName || '',
                        collectMonth: data.collectMonth || '',
                        collectTime: data.collectTime || '',
                        registUserName: data.registUserName || '',
                    };

                    // 设置订购信息
                    this.subscriptionInfo = {
                        farmerName: data.farmerName || '',
                        farmerCardNo: data.farmerCardNo || '',
                        collectAddress: data.collectAddress || '',
                        farmerMobile: data.farmerMobile || '',
                    };

                    // 设置价格数据
                    this.priceData = data.specss || [];

                    // 设置订购来源，用于判断是否显示种植户信息
                    this.orderSource = data.orderSource || '';

                    // 处理订购凭据文件
                    this.subscriptionFiles = data.agreementFiles || [];

                    // 为每个文件获取预览URL
                    await this.processAllFiles();
                } else {
                    this.$message.error(res.retMsg || '获取详情数据失败');
                }
            } catch (e) {
                console.error('API error:', e);
                this.$message.error('获取详情数据失败');
            } finally {
                this.loading = false;
            }
        },

        // 处理所有文件，获取预览URL
        async processAllFiles() {
            if (this.subscriptionFiles && this.subscriptionFiles.length) {
                for (const file of this.subscriptionFiles) {
                    if (!this.isImageFile(file.fileSuffix) && !this.isVideoFile(file.fileSuffix)) {
                        file.fileUrl = file.fileId;
                    } else {
                        file.fileUrl = await this.fetchFileUrl(file.fileId);
                    }
                }
            }
        },

        // 获取文件预览URL
        async fetchFileUrl(fileId) {
            if (!fileId) return null;

            try {
                const params = {
                    condition: {
                        primaryKey: fileId,
                    },
                };

                const response = await this.$request.post('/file/preview', params, {
                    responseType: 'arraybuffer',
                });

                const blob = new Blob([response.data]);
                const objectUrl = URL.createObjectURL(blob);
                return objectUrl;
            } catch (error) {
                console.error('Error fetching file URL:', error);
                return null;
            }
        },

        // 判断文件是否为图片
        isImageFile(fileSuffix) {
            if (!fileSuffix) return false;
            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
            return imageExtensions.includes(fileSuffix.toLowerCase());
        },

        // 判断文件是否为视频
        isVideoFile(fileSuffix) {
            if (!fileSuffix) return false;
            const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'];
            return videoExtensions.includes(fileSuffix.toLowerCase());
        },

        handleFileClick(file) {
            if (!file.fileUrl) return;

            if (file.fileSuffix && file.fileSuffix.toLowerCase() === 'pdf') {
                this.downloadFile(file.fileUrl, file.fileName);
            } else if (this.isDocumentFile(file.fileSuffix)) {
                this.downloadFile(file.fileUrl, file.fileName);
            } else {
                this.viewFile(file.fileUrl);
            }
        },

        isDocumentFile(fileSuffix) {
            if (!fileSuffix) return false;
            const docExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
            return docExtensions.includes(fileSuffix.toLowerCase());
        },

        // 查看文件（视频）
        viewFile(url) {
            if (url) {
                window.open(url, '_blank');
            }
        },

        // 下载文件
        downloadFile(url, fileName) {
            console.log(url, 'url');
            if (url) {
                const params = {
                    condition: {
                        primaryKey: url,
                    },
                };
                this.$request.post('/file/preview', params, {
                    responseType: 'arraybuffer',
                })
                    .then((response) => {
                        const blob = new Blob([response.data]);
                        const url = window.URL.createObjectURL(blob);
                        let link = document.createElement('a');
                        link.style.display = 'none';
                        link.href = url;
                        link.setAttribute('download', fileName);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    });
            }
        },

        goBack() {
            this.$router.back();
        },
    },
});
</script>

<style lang="less" scoped>
.detail-container {
    // padding: 20px;
}

.section {
    margin-bottom: 40px;
}

.section-title {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 20px;

    .section-title-marker {
        width: 4px;
        height: 16px;
        background-color: var(--td-brand-color);
        margin-right: 8px;
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

.price-info {
    margin-top: 20px;
}

.evidence-section {
    margin-top: 24px;
}

.credentials-container {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 16px;
}

.credential-item {
    width: 120px;
    height: 120px;
    cursor: pointer;
}

video {
    height: 100%;
    width: 100%;
}

.image-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e5e5e5;
    overflow: hidden;
    position: relative;
}

.credential-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.downVideo {
    height: 20px;
    position: absolute;
    right: 0;
    top: 0px;
    color: red;
    font-size: 20px;
    z-index: 999;
}

.file-container {
    width: 100%;
    height: 100%;
    border: 1px solid #e5e5e5;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
}

.file-icon {
    width: 60px;
    height: 60px;
    background-color: #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
}

.file-type {
    font-style: normal;
    font-size: 12px;
    font-weight: bold;
}

.file-name {
    font-size: 12px;
    text-align: center;
    padding: 0 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
}

.image-placeholder {
    width: 100%;
    height: 100%;
    border: 1px dashed #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    position: relative;
}

.placeholder-x {
    position: relative;
    width: 100%;
    height: 100%;

    &:before,
    &:after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 80%;
        height: 1px;
        background-color: #ccc;
    }

    &:before {
        transform: translate(-50%, -50%) rotate(45deg);
    }

    &:after {
        transform: translate(-50%, -50%) rotate(-45deg);
    }
}

.action-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 40px;
    padding: 16px 0;
    z-index: 10;
}

.detail-container {
    padding-bottom: 20px;
    position: relative;
}

/* 图片查看器样式 */
.tdesign-demo-image-viewer__ui-image {
    width: 100%;
    height: 100%;
    display: inline-flex;
    position: relative;
    justify-content: center;
    align-items: center;
    border-radius: var(--td-radius-small);
    overflow: hidden;
}

.tdesign-demo-image-viewer__ui-image--hover {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0;
    background-color: rgba(0, 0, 0, 0.6);
    color: var(--td-text-color-anti);
    line-height: 22px;
    transition: 0.2s;
}

.tdesign-demo-image-viewer__ui-image:hover .tdesign-demo-image-viewer__ui-image--hover {
    opacity: 1;
    cursor: pointer;
}

.tdesign-demo-image-viewer__ui-image--img {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    cursor: pointer;
    position: absolute;
}

.tdesign-demo-image-viewer__base {
    width: 120px;
    height: 120px;
    margin: 0;
    border: 1px solid var(--td-bg-color-secondarycontainer);
    border-radius: var(--td-radius-medium);
}
</style>