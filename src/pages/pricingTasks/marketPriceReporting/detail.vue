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
            <t-row :gutter="[16, 16]">
              <t-col :span="4">
                <div class="field-item">
                  <label>任务编号</label>
                  <t-input v-model="basicInfo.auditTaskId" disabled placeholder="" />
                </div>
              </t-col>
              <t-col :span="4">
                <div class="field-item">
                  <label>采价员</label>
                  <t-input v-model="basicInfo.pricingPersonnel" disabled placeholder="" />
                </div>
              </t-col>
              <t-col :span="4">
                <div class="field-item">
                  <label>上报时间</label>
                  <t-input v-model="basicInfo.reportDate" disabled placeholder="" />
                </div>
              </t-col>
              <t-col :span="4" v-show="collectResource == '3'">
                <div class="field-item">
                  <label>上报地点</label>
                  <t-input v-model="basicInfo.reportLocation" disabled placeholder="" />
                </div>
              </t-col>

              <t-col :span="4">
                <div class="field-item">
                  <label>采价来源</label>
                  <t-input v-model="basicInfo.pricingSource" disabled placeholder="" />
                </div>
              </t-col>
              <t-col :span="4" v-show="['2'].includes(collectResource)">
                <div class="field-item">
                  <label>采价方式</label>
                  <t-input v-model="basicInfo.collectTypeStr" disabled placeholder="" />
                </div>
              </t-col>
              <t-col :span="4" v-show="['2'].includes(collectResource)">
                <div class="field-item">
                  <label>占比 (%)</label>
                  <t-input v-model="basicInfo.collectRate" disabled placeholder="" />
                </div>
              </t-col>

              <t-col :span="4" v-show="['2'].includes(collectResource)">
                <div class="field-item">
                  <label>实际采价占比</label>
                  <t-input v-model="basicInfo.actualCollectRate" disabled placeholder="" />
                </div>
              </t-col>
              <t-col :span="4">
                <div class="field-item">
                  <label>审核状态</label>
                  <t-input v-model="basicInfo.auditStatus" disabled placeholder="" />
                </div>
              </t-col>
            </t-row>
          </div>
        </div>

        <div class="section">
          <div class="section-title">
            <span class="section-title-marker"></span>
            <span>采价信息</span>
          </div>

          <div class="price-points-section">
            <!-- 左侧导航栏 -->
            <div class="sidebar-navigation">
              <div class="navigation-header">采价点列表</div>
              <div class="navigation-list">
                <div v-for="(point, index) in pricingPoints" :key="index"
                  :class="['navigation-item', currentPointIndex === index ? 'active' : '']"
                  @click="currentPointCLick(point, index)">
                  {{ point.name }}
                </div>
              </div>
            </div>

            <!-- 右侧内容区域 -->
            <div class="point-content">
              <div class="price-point-header">{{ currentPoint.stallName }}</div>

              <div class="price-point-details">
                <t-row :gutter="[16, 16]">
                  <t-col :span="4">
                    <div class="field-item">
                      <label>行政区划</label>
                      <t-input v-model="currentPoint.areaname" disabled placeholder="" />
                    </div>
                  </t-col>
                  <t-col :span="4">
                    <div class="field-item">
                      <label>详细地址</label>
                      <t-input v-model="currentPoint.collectAddress" disabled placeholder="" />
                    </div>
                  </t-col>
                  <t-col :span="4">
                    <div class="field-item">
                      <label>采价点类型</label>
                      <t-input v-model="currentPoint.stallTypeName" disabled placeholder="" />
                    </div>
                  </t-col>
                </t-row>

                <t-row :gutter="[16, 16]">
                  <t-col :span="4">
                    <div class="field-item">
                      <label>采价点归属</label>
                      <t-input v-model="currentPoint.stallVestName" disabled placeholder="" />
                    </div>
                  </t-col>
                  <t-col :span="4">
                    <div class="field-item">
                      <label>采价点联系人</label>
                      <t-input v-model="currentPoint.linkerName" disabled placeholder="" />
                    </div>
                  </t-col>
                  <t-col :span="4">
                    <div class="field-item">
                      <label>采价点联系电话</label>
                      <t-input v-model="currentPoint.linkerMobile" disabled placeholder="" />
                    </div>
                  </t-col>
                </t-row>

                <div class="price-info">
                  <div class="price-info-title">价格信息</div>

                  <div class="category-tabs" v-if="categories.length > 0">
                    <t-tabs v-model="activeTabIndex" @change="onTabChange">
                      <t-tab-panel v-for="(category, index) in categories" :key="category.collectCategoryId"
                        :value="index" :label="category.categoryName">
                        <div class="tab-content">
                          <div class="category-info-row">
                            <div class="info-item">
                              <span>{{ currentCategoryData.priceType }}</span>
                            </div>
                            <div class="info-item">
                              <span>备注：{{ formatSmallVarieties(currentCategoryData.smallVarieties) }}</span>
                            </div>
                            <div class="info-item">
                              <span>价格日期：{{ currentCategoryData.collectDate }}</span>
                            </div>
                          </div>
                          <t-table :data="currentCategoryData.specss || []" :columns="priceColumns" rowKey="id"
                            bordered>
                            <template #specsType="{ row }">
                              <span>{{ specsType[row.specsType] }}</span>
                            </template>
                            <template #specification="{ row }">
                              <span>{{ formater(row, row.fvSpecsUnit) }}</span>
                            </template>
                            <template #unitPriceStr="{ row }">
                              <span>{{ row.unitPrice }}元/{{ row.varietyUnitCnm }}</span>
                            </template>
                            <template #weight="{ row }">
                              <span>{{ row.weight }}</span>
                            </template>
                            <template #auditStatus="{ row }">
                              <t-switch :value="row.auditStatus === '1'"
                                :disabled="basicInfo.auditStatus !== '待审核' || hideButtons === 'true'"
                                @change="handleAuditStatusChange(row, $event)" />
                            </template>
                          </t-table>

                          <div class="evidence-section">
                            <div class="evidence-title">价格佐证凭据</div>
                            <div class="credentials-container">
                              <t-image-viewer v-for="(file, index) in currentPriceImageFiles" :key="file.fileId"
                                :default-index="index" :images="currentPriceImageUrls">
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
                              <div v-for="file in currentPriceVideoFiles" :key="file.fileId" class="credential-item">
                                <div class="image-container">
                                  <icon-font name="cloud-download" class="downVideo"
                                    @click="downloadFile(file.fileId, file.fileName)" />
                                  <video :src="file.fileUrl" autoplay controls controlsList="nodownload"></video>
                                </div>
                              </div>

                              <!-- 其他类型文件 -->
                              <div v-for="file in currentPriceOtherFiles" :key="file.fileId" class="credential-item">
                                <div class="file-container" @click="handleFileClick(file)">
                                  <div class="file-icon">
                                    <i class="file-type">{{ file.fileSuffix }}</i>
                                  </div>
                                  <div class="file-name">{{ file.fileName }}</div>
                                </div>
                              </div>

                              <!-- 如果没有文件，显示占位符 -->
                              <div
                                v-if="!currentPriceOtherFiles.length && !currentPriceVideoFiles.length && !currentPriceImageFiles.length"
                                class="credential-item">
                                <div class="image-placeholder">
                                  <div class="placeholder-x"></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div class="save-button-container"
                            v-if="basicInfo.auditStatus === '待审核' && hideButtons !== 'true'">
                            <t-button theme="primary" @click="handleSave">保存</t-button>
                          </div>

                          <!-- <div class="pricing-images-section">
                            <div class="section-subtitle">采价信息</div>
                            <div class="credentials-container">
                              <t-image-viewer
                                v-for="(file, index) in currentCollectImageFiles"
                                :key="file.fileId"
                                :default-index="index"
                                :images="currentCollectImageUrls"
                              >
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

                              <div v-for="file in currentCollectVideoFiles" :key="file.fileId" class="credential-item">
                                <div class="image-container">
                                  <icon-font name="cloud-download" class="downVideo"
                                    @click="downloadFile(file.fileId, file.fileName)" />
                                  <video :src="file.fileUrl" autoplay controls controlsList="nodownload"></video>
                                </div>
                              </div>

                              <div v-for="file in currentCollectOtherFiles" :key="file.fileId" class="credential-item">
                                <div class="file-container" @click="handleFileClick(file)">
                                  <div class="file-icon">
                                    <i class="file-type">{{ file.fileSuffix }}</i>
                                  </div>
                                  <div class="file-name">{{ file.fileName }}</div>
                                </div>
                              </div>

                              <div v-if="!currentCollectOtherFiles.length && !currentCollectVideoFiles.length && !currentCollectImageFiles.length"
                                class="credential-item">
                                <div class="image-placeholder">
                                  <div class="placeholder-x"></div>
                                </div>
                              </div>
                            </div>
                          </div> -->
                        </div>
                      </t-tab-panel>
                    </t-tabs>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- <div class="section" v-if="auditOpinion.trim() || (basicInfo.auditStatus === '待审核' && hideButtons !== 'true')">
          <div class="section-title">
            <span class="section-title-marker"></span>
            <span>审核意见</span>
          </div>
          <div class="audit-opinion">
            <t-textarea v-model="auditOpinion" placeholder="请输入审核意见..." :autosize="{ minRows: 2 }"
              :disabled="isAuditOpinionReadonly || hideButtons === 'true'" />
          </div>
        </div> -->

        <div class="action-buttons">
          <t-button theme="default" @click="goBack">返回</t-button>
          <t-button theme="success" @click="handleApprove"
            v-if="basicInfo.auditStatus === '待审核' && hideButtons !== 'true'">确认提交</t-button>
          <!-- <t-button theme="danger" @click="handleReject"
            v-if="basicInfo.auditStatus === '待审核' && hideButtons !== 'true'">审核不通过</t-button> -->
        </div>
      </div>
    </t-card>
    <t-dialog :visible.sync="confirmDialogVisible" :header="confirmDialogTitle" :onConfirm="onConfirmAudit"
      :onCancel="onCancelAudit" width="420px">
      <p>{{ confirmDialogContent }}</p>
    </t-dialog>
  </t-loading>
</template>

<script lang="ts">
import Vue from 'vue';
import { BrowseIcon } from 'tdesign-icons-vue';
import env from '@/config/host';
import { IconFont } from 'tdesign-icons-vue';
export default Vue.extend({
  name: 'MarketPriceReportingDetail',
  components: {
    BrowseIcon,
    IconFont,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    hideButtons: {
      type: String,
      default: 'false'
    }
  },
  data() {
    return {
      confirmDialogVisible: false,
      confirmDialogTitle: '',
      confirmDialogContent: '',
      pendingAuditResult: '', // 暂存待提交的审核结果
      collectResource: '',
      specsType: {
        DIAMETER: '按果径',
        WEIGHT: '按重量',
        WHOLE: '按统果',
      },
      BaseUrl: env[import.meta.env.MODE].imageUrl,
      loading: false,
      currentPointIndex: 0,
      currentPoint: {},
      auditOpinion: '',
      basicInfo: {
        auditTaskId: '',
        pricingPersonnel: '',
        reportTime: '',
        reportLocation: '',
        pricingSource: '',
        comparisonMethod: '',
        percentage: '',
        actualPercentage: '',
        auditStatus: '',
      },
      pricingPoints: [],
      priceColumns: [
        { title: '渠道', colKey: 'saleChannelCnm' },
        { title: '计价方式', colKey: 'specsType' },
        { title: '规格', colKey: 'specification' },
        { title: '价格', colKey: 'unitPriceStr' },
        { title: '数量（kg）', colKey: 'weight' },
        { title: '有效/无效', colKey: 'auditStatus' },
      ],
      categories: [], // 品类列表
      activeTabIndex: 0, // 当前激活的tab索引
      currentCategoryData: {}, // 当前品类的详细数据
    };
  },
  computed: {
    // 当前品类的价格佐证凭据中的图片文件
    currentPriceImageFiles() {
      if (!this.currentCategoryData.priceFileIds) return [];
      return this.currentCategoryData.priceFileIds.filter((file) => this.isImageFile(file.fileSuffix));
    },
    // 当前品类的价格佐证凭据中的图片URL
    currentPriceImageUrls() {
      return this.currentPriceImageFiles.map((file) => file.fileUrl);
    },
    // 当前品类的价格佐证凭据中的视频文件
    currentPriceVideoFiles() {
      if (!this.currentCategoryData.priceFileIds) return [];
      return this.currentCategoryData.priceFileIds.filter((file) => this.isVideoFile(file.fileSuffix));
    },
    // 当前品类的价格佐证凭据中的其他文件
    currentPriceOtherFiles() {
      if (!this.currentCategoryData.priceFileIds) return [];
      return this.currentCategoryData.priceFileIds.filter(
        (file) => !this.isImageFile(file.fileSuffix) && !this.isVideoFile(file.fileSuffix),
      );
    },
    // 当前品类的采价信息中的图片文件
    currentCollectImageFiles() {
      if (!this.currentCategoryData.collectFileIds) return [];
      return this.currentCategoryData.collectFileIds.filter((file) => this.isImageFile(file.fileSuffix));
    },
    // 当前品类的采价信息中的图片URL
    currentCollectImageUrls() {
      return this.currentCollectImageFiles.map((file) => file.fileUrl);
    },
    // 当前品类的采价信息中的视频文件
    currentCollectVideoFiles() {
      if (!this.currentCategoryData.collectFileIds) return [];
      return this.currentCategoryData.collectFileIds.filter((file) => this.isVideoFile(file.fileSuffix));
    },
    // 当前品类的采价信息中的其他文件
    currentCollectOtherFiles() {
      if (!this.currentCategoryData.collectFileIds) return [];
      return this.currentCategoryData.collectFileIds.filter(
        (file) => !this.isImageFile(file.fileSuffix) && !this.isVideoFile(file.fileSuffix),
      );
    },
    // 控制审核意见是否为只读
    isAuditOpinionReadonly() {
      return this.basicInfo.auditStatus !== '待审核' || this.hideButtons === 'true';
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    currentPointCLick(point, index) {
      this.currentPointIndex = index;
      this.getPointDetil(point.collectResource, point);
      this.collectResource = point.collectResource;
    },
    formater(row, unit) {
      if (row.fvSpecsMin && row.fvSpecsMax) {
        return `${row.fvSpecsMin}${unit}-${row.fvSpecsMax}${unit}`;
      } else if (row.fvSpecsMin) {
        return `${row.fvSpecsMin}${unit}以上`;
      } else if (row.fvSpecsMax) {
        return `${row.fvSpecsMax}${unit}以下`;
      }
    },
    getPointDetil(collectResource, point) {
      this.loading = true;
      let RequestURL = {
        '1': 'large/getLargeCollectPrice',
        '2': 'collect/getCollectPrice',
        '3': 'owner/getWxCollecpriceTask',
      };
      let params = {
        condition: {
          primaryKey: point.collectPriceId,
        },
      };
      this.$request
        .post(`/web/${RequestURL[collectResource]}`, params)
        .then(async (res) => {
          console.log(res);
          if (res.retCode === 200) {
            const data = res.retData;
            this.currentPoint = data;
            console.log(this.currentPoint);
            if (data.categories && data.categories.length > 0) {
              this.categories = data.categories;
              this.activeTabIndex = 0;
              await this.getCategoryDetail(this.categories[0].collectCategoryId, collectResource);
            }

            if (collectResource == '3') {
              this.currentPoint.collectFileIds = data.collectFileIds;
              this.currentPoint.collectFileIds?.forEach(async (v) => {
                if (!this.isImageFile(v.fileSuffix) && !this.isVideoFile(v.fileSuffix)) {
                  v.fileUrl = v.fileId;
                } else {
                  v.fileUrl = await this.fetchFileUrl(v.fileId);
                }
                return v;
              });
              this.currentPoint.priceFileIds = data.priceFileIds;
              this.currentPoint.priceFileIds?.forEach(async (v) => {
                if (!this.isImageFile(v.fileSuffix) && !this.isVideoFile(v.fileSuffix)) {
                  v.fileUrl = v.fileId;
                } else {
                  v.fileUrl = await this.fetchFileUrl(v.fileId);
                }
                return v;
              });
            } else {
              this.currentPoint.areaname = data.areaName;
              this.currentPoint.collectFileIds = data.collectFiles;
              this.currentPoint.collectFileIds?.forEach(async (v) => {
                if (!this.isImageFile(v.fileSuffix) && !this.isVideoFile(v.fileSuffix)) {
                  v.fileUrl = v.fileId;
                } else {
                  v.fileUrl = await this.fetchFileUrl(v.fileId);
                }
                return v;
              });
              this.currentPoint.priceFileIds = data.priceFiles;
              this.currentPoint.priceFileIds?.forEach(async (v) => {
                if (!this.isImageFile(v.fileSuffix) && !this.isVideoFile(v.fileSuffix)) {
                  v.fileUrl = v.fileId;
                } else {
                  v.fileUrl = await this.fetchFileUrl(v.fileId);
                }
                return v;
              });
              if (data.specsVoList && data.specsVoList.length) {
                this.currentPoint.specss = data.specsVoList.map((v) => {
                  v.saleChannelCnm = v.saleChannelName;
                  return v;
                });
              }
            }
            if (collectResource == '2') {
              this.currentPoint.specss = data.specss.map((v) => {
                v.saleChannelCnm = v.saleChannelName;
                return v;
              });
            }
            console.log(this.currentPoint, 'this.currentPoint');
          } else {
            this.$message.error(res.retMsg || '获取详情数据失败');
          }
        })
        .catch((e) => {
          console.error('API error:', e);
          // this.$message.error('获取详情数据失败');
        })
        .finally(() => {
          this.loading = false;
        });
    },

    async getCategoryDetail(collectCategoryId, collectResource) {
      if (!collectCategoryId) return;

      this.loading = true;

      const apiMap = {
        '1': '/web/large/getCollectCategory',
        '2': '/web/collect/getCollectCategory',
        '3': '/web/owner/getOwnerCollectCategory'
      };

      const apiUrl = apiMap[collectResource];

      const params = {
        condition: {
          primaryKey: collectCategoryId
        }
      };

      try {
        const res = await this.$request.post(apiUrl, params);

        if (res.retCode === 200) {
          this.currentCategoryData = res.retData;

          // 处理文件URL
          if (this.currentCategoryData.priceFileIds) {
            await Promise.all(this.currentCategoryData.priceFileIds.map(async (file) => {
              if (this.isImageFile(file.fileSuffix) || this.isVideoFile(file.fileSuffix)) {
                file.fileUrl = await this.fetchFileUrl(file.fileId);
              } else {
                file.fileUrl = file.fileId;
              }
            }));
          }

          if (this.currentCategoryData.collectFileIds) {
            await Promise.all(this.currentCategoryData.collectFileIds.map(async (file) => {
              if (this.isImageFile(file.fileSuffix) || this.isVideoFile(file.fileSuffix)) {
                file.fileUrl = await this.fetchFileUrl(file.fileId);
              } else {
                file.fileUrl = file.fileId;
              }
            }));
          }

          // 处理规格数据
          if (this.currentCategoryData.specss) {
            this.currentCategoryData.specss = this.currentCategoryData.specss.map((v) => {
              v.saleChannelCnm = v.saleChannelName || v.saleChannelCnm;
              return v;
            });
          }
        } else {
          this.$message.error(res.retMsg || '获取分类详情失败');
        }
      } catch (error) {
        console.error('获取分类详情失败:', error);
        this.$message.error('获取分类详情失败');
      } finally {
        this.loading = false;
      }
    },

    async onTabChange(index) {
      this.activeTabIndex = index;
      const category = this.categories[index];
      if (category && category.collectCategoryId) {
        await this.getCategoryDetail(category.collectCategoryId, this.collectResource);
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

    // 下载
    // @param  {String} url 目标文件地址
    // @param  {String} filename 想要保存的文件名称
    courseDownload(url, filename) {
      let that = this;
      this.getBlob(this.BaseUrl + url, function (blob) {
        that.saveAs(blob, filename);
      });
    },
    getBlob(url, cb) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';
      xhr.onload = function () {
        if (xhr.status === 200) {
          cb(xhr.response);
        }
      };
      xhr.send();
    },
    // 保存
    // @param  {Blob} blob
    // @param  {String} filename 想要保存的文件名称
    saveAs(blob, filename) {
      if (window.navigator.msSaveOrOpenBlob) {
        navigator.msSaveBlob(blob, filename);
      } else {
        var link = document.createElement('a');
        var body = document.querySelector('body');

        link.href = window.URL.createObjectURL(blob);
        link.download = filename;

        // fix Firefox
        link.style.display = 'none';
        body.appendChild(link);

        link.click();
        body.removeChild(link);

        window.URL.revokeObjectURL(link.href);
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
        console.log(objectUrl);
        return objectUrl;
      } catch (error) {
        console.error('Error fetching file URL:', error);
        return null;
      }
    },

    async processAllFiles() {
      if (this.pricingPoints && this.pricingPoints.length) {
        for (const point of this.pricingPoints) {
          if (point.priceFiles && point.priceFiles.length) {
            for (const file of point.priceFiles) {
              if (!file.fileUrl && file.fileId) {
                file.fileUrl = await this.fetchFileUrl(file.fileId);
              }
            }
          }

          if (point.collectFiles && point.collectFiles.length) {
            for (const file of point.collectFiles) {
              if (!file.fileUrl && file.fileId) {
                file.fileUrl = await this.fetchFileUrl(file.fileId);
              }
            }
          }
        }
      }
    },

    fetchData() {
      this.loading = true;

      const params = {
        condition: {
          primaryKey: this.id,
        },
      };

      this.$request
        .post('/web/collectAudit/getCollectAudit', params)
        .then(async (res) => {
          if (res.retCode === 200) {
            const data = res.retData;

            // 设置基础信息
            this.basicInfo = {
              ...data,
              auditTaskId: data.auditTaskId || '',
              pricingPersonnel: data.collectorName || '',
              reportTime: data.reportDate || '',
              reportLocation: data.reportLocation || '',
              pricingSource: data.collectResourceName || '',
              comparisonMethod: data.collectTypeStr || '',
              percentage: data.collectRate || '',
              actualPercentage: data.actualCollectRate || '',
              auditStatus: this.getAuditStatusText(data.auditResult),
            };

            // 如果已审核，回显审核意见
            if (data.auditResult === '1' || data.auditResult === '2') {
              this.auditOpinion = data.auditOpinion || '';
            }

            // 处理采价点信息
            this.processPricingPoints(data.stallPrices || []);
            this.loading = false;
            if (data.stallPrices.length) {
              const { collectResource } = data.stallPrices[0];
              this.collectResource = collectResource;

              this.getPointDetil(collectResource, data.stallPrices[0]);
            }
            await this.processAllFiles();
          } else {
            this.$message.error(res.retMsg || '获取详情数据失败');
          }
        })
        .catch((e) => {
          console.error('API error:', e);
          // this.$message.error('获取详情数据失败');
        })
        .finally(() => {
          this.loading = false;
        });
    },
    processPricingPoints(priceVoList) {
      if (!priceVoList || priceVoList.length === 0) {
        this.pricingPoints = [];
        return;
      }

      this.pricingPoints = priceVoList.map((item) => {
        return {
          name: item.stallName || '',
          collectPriceId: item.collectPriceId,
          collectResource: item.collectResource,
          adminRegion: item.areaName || '',
          address: item.collectAddress || '',
          pointType: item.stallTypeName || '',
          pointAffiliation: item.stallVestName || '',
          contactPerson: item.linkerName || '',
          contactPhone: item.linkerMobile || '',
          majorCategory: item.varietyName || '',
          minorCategory: item.categoryName || '',
          priceDate: item.collectDate || '',
          priceFiles: item.priceFiles || [],
          collectFiles: item.collectFiles || [],
          priceData: this.processPriceData(item.specsVoList || []),
        };
      });
    },
    // 规格价格数据
    processPriceData(specsVoList) {
      return specsVoList.map((spec, index) => {
        return {
          id: spec.collectSpecsId || index.toString(),
          channel: spec.saleChannelName || '',
          calculationMethod: spec.fvSpecs || '',
          specification: spec.specsTypeName || '',
          price: spec.unitPriceStr || '',
          weight: spec.weight || '',
          auditStatus: spec.auditStatus || '0',
        };
      });
    },
    // 获取审核状态文本
    getAuditStatusText(auditResult) {
      const statusMap = {
        '0': '待审核',
        '1': '审核通过',
        '2': '审核不通过',
      };
      return statusMap[auditResult] || '未知状态';
    },
    // 转换 smallVarieties 值
    formatSmallVarieties(value) {
      const varietiesMap = {
        'ORDER_PRICE': '订单价',
        'FARMER_SALE_PRICE': '离地价',
        'BUY_PRICE': '收购价',
        'SELL_PRICE': '出售价',
        'WITH_SALES_PRICE': '带销售价'
      };
      return varietiesMap[value] || value;
    },
    // 处理有效/无效状态变化
    handleAuditStatusChange(row, value) {
      row.auditStatus = value ? '1' : '0';
      console.log('规格ID:', row.collectSpecsId, '新状态:', row.auditStatus);
    },
    handleSave() {
      if (!this.currentCategoryData.specss || this.currentCategoryData.specss.length === 0) {
        this.$message.warning('没有可保存的规格数据');
        return;
      }

      this.loading = true;

      // 构造参数
      const params = {
        condition: {
          specss: this.currentCategoryData.specss.map(spec => ({
            auditStatus: spec.auditStatus,
            collectCategoryId: spec.collectCategoryId,
            collectPriceId: spec.collectPriceId,
            collectSpecsId: spec.collectSpecsId
          }))
        }
      };

      this.$request.post('/web/collectAudit/collectAuditEffective', params)
        .then(res => {
          if (res.retCode === 200) {
            this.$message.success('保存成功');
            // 刷新当前品类数据
            this.getCategoryDetail(this.currentCategoryData.collectCategoryId,this.collectResource);
          } else {
            this.$message.error(res.retMsg || '保存失败');
          }
        })
        .catch(e => {
          console.error('保存失败:', e);
          this.$message.error('保存失败');
        })
        .finally(() => {
          this.loading = false;
        });
    },
    goBack() {
      this.$router.back();
    },
    handleApprove() {
      this.confirmDialogTitle = '审核通过';
      this.confirmDialogContent = '是否确认审核结果？';
      this.pendingAuditResult = '1';
      this.confirmDialogVisible = true;
    },
    handleReject() {
      if (!this.auditOpinion.trim()) {
        this.$message.warning('请填写审核意见');
        return;
      }

      this.confirmDialogTitle = '审核不通过';
      this.confirmDialogContent = '是否确认审核结果？';
      this.pendingAuditResult = '2';
      this.confirmDialogVisible = true;
    },
    // 添加确认审核方法
    onConfirmAudit() {
      this.confirmDialogVisible = false;
      this.submitAuditResult(this.pendingAuditResult);
    },

    // 添加取消审核方法
    onCancelAudit() {
      this.confirmDialogVisible = false;
      this.pendingAuditResult = '';
    },
    submitAuditResult(auditResult) {
      this.loading = true;

      const params = {
        auditId: this.id,
        auditOpinion: this.auditOpinion,
        auditResult: auditResult,
      };

      this.$request
        .post('/web/collectAudit/auditCollectTask', params)
        .then((res) => {
          if (res.retCode === 200) {
            this.basicInfo.auditStatus = auditResult === '1' ? '审核通过' : '审核不通过';
            this.$message.success(auditResult === '1' ? '审核通过' : '审核不通过');

            this.goBack();
          } else {
            this.$message.error(res.retMsg || '审核操作失败');
          }
        })
        .catch((e) => {
          console.error('API error:', e);
          this.$message.error('审核操作失败');
        })
        .finally(() => {
          this.loading = false;
        });
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

.sub-section {
  margin-top: 24px;
  margin-bottom: 24px;
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

.price-points-section {
  display: flex;
  border: 1px solid #e5e5e5;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 20px;
}

.sidebar-navigation {
  width: 200px;
  border-right: 1px solid #e5e5e5;
}

.navigation-header {
  background-color: #6aaa5a;
  color: white;
  padding: 10px 16px;
  font-weight: bold;
}

.navigation-list {
  height: 100%;
}

.navigation-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #e5e5e5;
}

.navigation-item:hover {
  background-color: #f5f5f5;
}

.navigation-item.active {
  border-right: 3px solid #1890ff;
  font-weight: bold;
}

.point-content {
  flex: 1;
}

.price-point-header {
  background-color: #6aaa5a;
  color: white;
  padding: 10px 16px;
  font-weight: bold;
}

.price-point-details {
  padding: 16px;
}

.price-info {
  margin-top: 20px;
}

.price-info-title {
  font-weight: bold;
}

.category-tabs {

  .tab-content {
    padding-top: 16px;
  }
}

.evidence-section {
  margin-top: 24px;
}

.evidence-title {
  font-weight: bold;
  margin-bottom: 16px;
}

.section-subtitle {
  font-weight: bold;
  margin: 24px 0 16px 0;
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

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
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

.video-icon {
  font-size: 32px;
  color: #1890ff;
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

.pricing-images-section {
  margin-top: 24px;
}

.audit-opinion {
  margin-top: 16px;
}

.save-button-container {
  margin-top: 20px;
  text-align: center;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  // position: sticky;
  bottom: 0;
  margin-top: 40px;
  padding: 16px 0;
  z-index: 10;
}

.detail-container {
  padding-bottom: 20px;
  position: relative;
}

.category-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.info-item {
  flex: 1;

  &:first-child {
    text-align: left;
  }

  &:nth-child(2) {
    text-align: center;
  }

  &:last-child {
    text-align: right;
  }

  span {
    font-weight: 500;
    color: var(--td-text-color-primary);
  }
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
