import os
import nrrd
import math
import mahotas as mh
import numpy as np
import matplotlib
import matplotlib.pyplot as plt
import scipy
from sklearn import metrics
from scipy import stats


class Util:

  @staticmethod
  def load(which, datapath='/home/d/Dropbox/RESEARCH/CAROTID/DATA/Nathan Arnett Calcification/', with_header=False):

    DATASETS = sorted([v for v in os.listdir(datapath) if os.path.isdir(datapath + v)])

    D = DATASETS[which]

    files = os.listdir(datapath + D)
    label_file = [os.path.join(datapath, D, s) for s in files if 'seg' in s]
    image_file = [os.path.join(datapath, D, i) for i in files if not 'seg' in i]
    label_file = [s for s in label_file if os.path.isfile(s)][0]
    image_file = [i for i in image_file if os.path.isfile(i)][0]

    label_with_header = nrrd.read(label_file)
    image_with_header = nrrd.read(image_file)

    label = label_with_header[0]
    image = image_with_header[0]

    if with_header:
      return image_with_header, label_with_header

    return image, label

  @staticmethod
  def crop(image, label, increase_xy=10, increase_z=0, target_size=None, just_z=False):

    bbox = mh.bbox(label) # ignore large portion of label since its all 0
                          # to only include annotated plaque regions

    increase_x = increase_xy
    increase_y = increase_xy

    if target_size:

      widthY = bbox[1]-bbox[0]
      widthX = bbox[3]-bbox[2]

      increase_x = (target_size - widthX) // 2
      increase_y = (target_size - widthY) // 2
      # print(bbox)
      # print(widthY, widthX, increase_x, increase_y)

      # if (target_size/2 != (increase_x+widthX)):
      #   print('error', target_size, (increase_x+widthX))


      # if (target_size/2 != (increase_y+widthY)):
      #   print('error', target_size, (increase_y+widthY))

      bufferY = 0
      if (bbox[0]-increase_y + bbox[1]+increase_y) != target_size:
        bufferY = 1

      bufferX = 0
      if (bbox[2]-increase_x + bbox[3]+increase_x) != target_size:
        bufferX = 1





    if just_z:

      increase_xy = 0
      bbox[0] = 0
      bbox[1] = image.shape[0]
      bbox[2] = 0
      bbox[3] = image.shape[1]


    # crop label and image according to bbox but make it a little larger
    label_cropped = label[bbox[0]-increase_y:bbox[1]+increase_y+bufferY, 
                          bbox[2]-increase_x:bbox[3]+increase_x+bufferX,
                          bbox[4]-increase_z:bbox[5]+increase_z]
    image_cropped = image[bbox[0]-increase_y:bbox[1]+increase_y+bufferY, 
                          bbox[2]-increase_x:bbox[3]+increase_x+bufferX,
                          bbox[4]-increase_z:bbox[5]+increase_z]

    # print(label_cropped.shape)

    return image_cropped, label_cropped

  @staticmethod
  def filter(image, label):
    '''
    removes all slices that have no annotation
    '''

    filtered_image = image.copy()
    filtered_label = label.copy()

    slices_to_remove = []

    for z in range(filtered_label.shape[2]):

      if filtered_label[:,:,z].max() == 0:

        slices_to_remove.append(z)

    slices_to_remove = sorted(slices_to_remove, reverse=True)

    for z in slices_to_remove:

        filtered_image = np.delete(filtered_image, z, 2)
        filtered_label = np.delete(filtered_label, z, 2)

    return filtered_image, filtered_label



  @staticmethod
  def binarize(label, threshold=0):

    label_bin = label.copy().astype(np.bool_)
    label_bin[:] = 0
    label_bin[label > threshold] = 1

    return label_bin

  @staticmethod
  def list_to_array(l):
    '''assuming all elements same size
    '''
    count = len(l)

    d_y = l[0].shape[0]
    d_x = l[0].shape[1]

    out = np.zeros((d_y, d_x, count), dtype=l[0].dtype)

    for i in range(count):

      c_d_y = min(d_y, l[i].shape[0])
      c_d_x = min(d_x, l[i].shape[1])

      out[0:c_d_y,0:c_d_x,i] = l[i][0:c_d_y,0:c_d_x,0]

    return out


  @staticmethod
  def view(image, label, alpha=0.7, title=None, vmin=-600, vmax=1000):
    '''
    '''

    masked = np.ma.masked_where(label==0, label)

    if image.ndim == 3:

      slices = image.shape[2]

    else:

      slices = 1

    fig = plt.figure(figsize=(slices,3))

    if title:
      fig.suptitle(title, fontsize=12, fontweight='bold')

    for i in range(slices):

      plt.subplot(1, slices, i+1)

      plt.axis('off')

      if slices > 1:
        plt.imshow(image[:,:,i], cmap='gray', vmin=vmin, vmax=vmax)
        plt.imshow(masked[:,:,i], cmap='jet', interpolation='none', alpha=alpha) 
      else:
        plt.imshow(image, cmap='gray', vmin=vmin, vmax=vmax)
        plt.imshow(masked, cmap='jet', interpolation='none', alpha=alpha) 


  @staticmethod
  def zoom(image, label, spacing, order=0):
    '''
    upsample image to 1,1,2 voxel size
    '''
    image_zoomed = scipy.ndimage.zoom(image, [1/spacing[1],1/spacing[0],2/spacing[2]], order=order)
    label_zoomed = scipy.ndimage.zoom(label, [1/spacing[1],1/spacing[0],2/spacing[2]], order=order)

    return image_zoomed, label_zoomed


  @staticmethod
  def overview(datapath='/home/d/Dropbox/RESEARCH/CAROTID/DATA/Nathan Arnett Calcification/'):

    DATASETS = sorted([v for v in os.listdir(datapath) if os.path.isdir(datapath + v)])

    for i,d in enumerate(DATASETS):

      image_with_header, label_with_header = Util.load(i, datapath=datapath, with_header=True)

      spacing = [image_with_header[1]['space directions'][0,0],
                 image_with_header[1]['space directions'][1,1],
                 image_with_header[1]['space directions'][2,2]]
      
      image = image_with_header[0]
      label = label_with_header[0]

      # crop according to all annotations
      image_cropped, label_cropped = Util.crop(image, label)

      # remove all slices without annotations
      image_filtered, label_filtered = Util.filter(image_cropped, label_cropped)

      image_zoomed, label_zoomed = Util.zoom(image_filtered, label_filtered, spacing)

      Util.view(image_zoomed, label_zoomed, title=d)

  @staticmethod
  def normalize(image):
    '''
    '''
    image_normalized = image.copy().astype(np.float64)

    image_normalized = (image_normalized - image_normalized.min()) / (image_normalized.max() - image_normalized.min())

    return image_normalized

  @staticmethod
  def parse_folder(folder):
    '''
    '''
    files = os.listdir(folder)
    size1 = os.path.getsize(folder+'/'+files[0])
    size2 = os.path.getsize(folder+'/'+files[1])
    
    if size1 < size2:
        segmentation = files[0]
        image = files[1]
    else:
        segmentation = files[1]
        image = files[0]

    return image, segmentation


  @staticmethod
  def jaccard(s1, s2):

    similarity = metrics.jaccard_score(s1.ravel(), 
                                       s2.ravel(),
                                       average="binary",
                                       zero_division=1.0)

    return similarity



  @staticmethod
  def pad(images, labels, force_512=True, force_power_of_2=True, force_square=True, center=True):
    '''
    images and labels need to be a list

    returns padded numpy array for both
    '''
    print('forcing power of 2', force_power_of_2)
    print('forcing square', force_square)
    print('centering', center)

    maxX = 0
    maxY = 0
    slicecount = 0

    for i in images:

      maxY = max(maxY, i.shape[0])
      maxX = max(maxX, i.shape[1])
      slicecount += i.shape[2] # running number of slices

    if force_512:
      maxY = 512
      maxX = 512

    if force_power_of_2:
      maxY = pow(2, math.ceil(math.log(maxY)/math.log(2)));
      maxX = pow(2, math.ceil(math.log(maxX)/math.log(2)));

    if force_square:
      maxY = max(maxY, maxX)
      maxX = max(maxY, maxX)

    startY = 0
    startX = 0



    padded_images = np.zeros((slicecount, maxY, maxX), dtype=images[0].dtype)
    padded_labels = np.zeros((slicecount, maxY, maxX), dtype=labels[0].dtype)

    currentslice = 0

    for i, img in enumerate(images):

      for z in range(images[i].shape[2]):


        if center:

          startY = (maxY - img.shape[0]) // 2
          startX = (maxX - img.shape[1]) // 2
          # print(startY, startX, maxY, maxX)

        padded_images[currentslice, startY:startY+img.shape[0], startX:startX+img.shape[1]] = images[i][:,:,z] 
        padded_labels[currentslice, startY:startY+img.shape[0], startX:startX+img.shape[1]] = labels[i][:,:,z]

        currentslice += 1

    return padded_images, padded_labels


  @staticmethod 
  def boxplot(all_data, labels, y_label='Time [s]', y_lim_min=0, y_lim=1000, title=None, outputdir='/home/d/Dropbox/RESEARCH/CAROTID/PLOTS/'):

    matplotlib.rcParams.update({'font.size': 32})
    plt.rc('axes', labelsize=48)    # fontsize of the x and y labels
    plt.rc('legend', fontsize=32)   
    plt.rc('xtick', labelsize=42) 

    # fig, (ax1, ax2) = plt.subplots(nrows=1, ncols=1, figsize=(9, 4))
    fig = plt.figure(figsize=(7, 13))
    ax = fig.gca()
    # ax1 = plt.gcf()
    boxprops = dict(color="black",linewidth=1.5)
    medianprops = dict(color="black",linewidth=1.5)
    # rectangular box plot
    bplot1 = plt.boxplot(all_data,
                         vert=True,  # vertical box alignment
                         patch_artist=True,  # fill with color
                         labels=labels,
                         boxprops=boxprops,
                         medianprops=medianprops)  # will be used to label x-ticks

    # fill with colors
    colors = ['#af8dc3', '#7fbf7b']
    # for bplot in (bplot1, bplot2):
    for patch, color in zip(bplot1['boxes'], colors):
        patch.set_facecolor(color)

    ax.set_ylabel(y_label)
    ax.set_ylim(y_lim_min,y_lim)

    titleb = title
    if not title:
      titleb = 'figure.pdf'



    filename_pdf = outputdir+'/'+titleb.replace(' ','_').replace(',','')+'.pdf'
    filename_png = outputdir+'/'+titleb.replace(' ','_').replace(',','')+'.png'
    plt.savefig(filename_pdf,bbox_inches='tight')
    plt.savefig(filename_png,bbox_inches='tight')

    if title:
      plt.title(title)


    plt.show()



    print(labels[0], np.mean(all_data[0]),'+/-', np.std(all_data[0]))
    print(labels[1], np.mean(all_data[1]),'+/-', np.std(all_data[1]))

    ttest = stats.ttest_ind(all_data[0],all_data[1])

    print('t_'+str(len(all_data[0]+all_data[1])), '=', str(round(ttest[0],3)), ',p=',str(round(ttest[1],2)))
