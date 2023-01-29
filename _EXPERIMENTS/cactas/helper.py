import keras, os
import numpy as np

import tensorflow.keras
from tensorflow.keras.callbacks import EarlyStopping
from keras_unet.models import custom_unet
from keras_unet.utils import get_augmented
from keras_unet.metrics import iou, iou_thresholded
from keras_unet.losses import jaccard_distance
from sklearn.model_selection import train_test_split


class Helper:

  @staticmethod
  def load(DATAPATH='/raid/mpsych/CACTAS/DATA/Nathan Arnett Calcification/'):
    '''
    '''
    images_file = os.path.join(DATAPATH, 'images.npy')
    labels_file = os.path.join(DATAPATH, 'labels.npy')

    images = np.load(images_file)
    labels = np.load(labels_file)

    if images.ndim != 4:
      images = images.reshape(images.shape[0],images.shape[1],images.shape[2],1)
      labels = labels.reshape(labels.shape[0],labels.shape[1],labels.shape[2],1)

    return images, labels


  @staticmethod
  def shuffle(images, labels):

    p = np.random.permutation(len(images))
    images = images[p]
    labels = labels[p]

    return images, labels


  @staticmethod
  def normalize(images, labels):

    images = images.astype(np.float32)
    labels = labels.astype(np.float32)

    for i in range(images.shape[0]):
        
        images[i] = (images[i] - images[i].min()) / (images[i].max() - images[i].min()) # normalize individually
        
    return images, labels


  @staticmethod
  def split(images, labels, val_size=0.2):

    X_train, X_val, y_train, y_val = train_test_split(images, labels, test_size=val_size, random_state=0)

    return X_train, X_val, y_train, y_val


  @staticmethod
  def augment(X_train, y_train):

    train_gen = get_augmented(
        X_train, y_train, batch_size=2,
        data_gen_args = dict(
            # rotation_range=5.,
            # width_shift_range=0.05,
            # height_shift_range=0.05,
            # shear_range=40,
            # zoom_range=0.2,
            # horizontal_flip=True,
            # vertical_flip=True,
            # fill_mode='constant'
        ))

    return train_gen

  @staticmethod
  def vis_augment(train_gen):

    sample_batch = next(train_gen)
    xx, yy = sample_batch
    print(xx.shape, yy.shape)
    from keras_unet.utils import plot_imgs

    plot_imgs(org_imgs=xx, mask_imgs=yy, nm_img_to_plot=2, figsize=6)


  @staticmethod
  def create_unet(input_shape):
    '''
    '''

    model = custom_unet(
        input_shape=input_shape,
        num_classes=1,
        filters=64,
        use_batch_norm=False,
        dropout=0.2,
        dropout_change_per_layer=0.0,
        num_layers=4,
        output_activation='sigmoid')


    opt = tensorflow.keras.optimizers.Adam(learning_rate=0.001)

    model.compile(optimizer = opt,    
                  loss='binary_crossentropy', 
                  # loss=jaccard_distance,
                  metrics=[iou, iou_thresholded])


    earlystopping = tensorflow.keras.callbacks.EarlyStopping(
        monitor="val_iou_thresholded",
        min_delta=0,
        patience=30,
        verbose=1,
        mode="max",
        baseline=None,
        restore_best_weights=True,
        # start_from_epoch=100
    )

    return model


  @staticmethod
  def load_unet(weightsfile='/raid/mpsych/CACTAS/unet_full_33_cases_weights.hdf5'):
    '''
    '''
    model = Helper.create_unet((512,512,1))
    model.load_weights('/raid/mpsych/CACTAS/unet_full_33_cases_weights.hdf5')

    return model


  @staticmethod
  def train_unet(train_gen, X_train, y_train, X_val, y_val, epochs=100):
    '''
    '''


    history = None


    model = Helper.create_unet(X_train.shape[0])


    batch_size = 32
    # history = model.fit_generator(train_gen, 
    #                               steps_per_epoch=len(X_train) // batch_size, 
    #                               validation_data=(X_val, y_val),
    #                               verbose=True,
    #                               epochs=epochs)
    history = model.fit(X_train,
                        y_train,
                        batch_size=batch_size, 
#                               steps_per_epoch=len(X_train) // batch_size, 
                        validation_data=(X_val, y_val),
#                               verbose=True,
                        epochs=epochs,)
                        # callbacks=[earlystopping])


    return model, history

