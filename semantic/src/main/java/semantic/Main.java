package semantic;

import semantic.mirror.Mirror;

public class Main {


    static Runnable worldBuilderRunnable = new Runnable() {

        public void run() {
            try {
                while(true){
                    Mirror.buildWord();
                    Thread.sleep(3 * 1000);
                }
            } catch (InterruptedException e) {
            }
        }
    };

    public static void main(String[] args) throws InterruptedException{

        Thread worldBuilder = new Thread(worldBuilderRunnable);
        worldBuilder.start();

        // You have to wait until the thread is started...
        Thread.sleep(1 * 1000);
        Mirror.getWorld();

    }
}
