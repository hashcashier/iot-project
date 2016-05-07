package semantic;

import org.bson.Document;

import com.mongodb.MongoClient;
import com.mongodb.client.MongoDatabase;

public class Main {




    public static void main(String[] args){
        MongoClient client = new MongoClient();
        MongoDatabase db = client.getDatabase("friend-finder");
        for(Document doc : db.listCollections()){

            System.out.println(doc);

        }

    }

}
