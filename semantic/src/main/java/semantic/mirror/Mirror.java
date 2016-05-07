package semantic.mirror;

import org.bson.Document;

import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import models.World;

public class Mirror {
    public static World getWorld(){
        MongoClient client = new MongoClient();
        MongoDatabase db = client.getDatabase("friend-finder");
        for(String colName : db.listCollectionNames()){
            if(colName.equals("system.indexes")) continue;
            System.out.println("================== " + colName + " ======================");
            MongoCollection<Document> collection = db.getCollection(colName);
            for(Document d : collection.find()){
                System.out.println(d.toJson());
            }
        }
        return null;
    }
}
